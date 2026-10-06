from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import shutil

from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.predict import predict_image
from backend.database import SessionLocal
from backend.models import User, Examination
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)


app = FastAPI(title="Sono AI API")

from backend.database import Base, engine
from backend import models

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
        "https://sono-ai-nu.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = db.query(User).filter(User.id == int(user_id)).first()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

@app.post("/auth/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }

@app.post("/auth/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == username).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/")
def root():
    return {"message": "Sono AI API is running"}


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(str(file_path))

    return result

@app.post("/examinations")
async def create_examination(
    patient_name: str = Form(...),
    patient_age: int = Form(...),
    patient_gender: str = Form(...),
    patient_contact: str = Form(None),
    prediction: str = Form(...),
    confidence: float = Form(...),
    image_path: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    examination = Examination(
        user_id=current_user.id,
        patient_name=patient_name,
        patient_age=patient_age,
        patient_gender=patient_gender,
        patient_contact=patient_contact,
        image_path=image_path,
        prediction=prediction,
        confidence=confidence
    )

    db.add(examination)
    db.commit()
    db.refresh(examination)

    return {
        "message": "Examination saved successfully",
        "examination_id": examination.id
    }

@app.get("/examinations")
def get_examinations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    examinations = (
        db.query(Examination)
        .filter(Examination.user_id == current_user.id)
        .order_by(Examination.created_at.desc())
        .all()
    )

    return examinations

@app.get("/examinations/{examination_id}")
def get_examination(
    examination_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    examination = (
        db.query(Examination)
        .filter(
            Examination.id == examination_id,
            Examination.user_id == current_user.id
        )
        .first()
    )

    if not examination:
        raise HTTPException(
            status_code=404,
            detail="Examination not found"
        )

    return examination

@app.get("/examinations/{examination_id}/report")
def download_report(
    examination_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    examination = (
        db.query(Examination)
        .filter(
            Examination.id == examination_id,
            Examination.user_id == current_user.id
        )
        .first()
    )

    if not examination:
        raise HTTPException(
            status_code=404,
            detail="Examination not found"
        )

    from reportlab.pdfgen import canvas

    report_path = UPLOAD_DIR / f"examination_{examination.id}_report.pdf"

    pdf = canvas.Canvas(str(report_path))

    pdf.setTitle("Sono AI - Breast Ultrasound Report")

    pdf.drawString(180, 800, "BREAST ULTRASOUND")
    pdf.drawString(175, 780, "AI ANALYSIS REPORT")

    pdf.drawString(70, 730, f"Patient Name: {examination.patient_name}")
    pdf.drawString(70, 700, f"Age: {examination.patient_age}")
    pdf.drawString(70, 670, f"Gender: {examination.patient_gender}")
    pdf.drawString(70, 640, f"Contact: {examination.patient_contact or 'N/A'}")

    pdf.drawString(70, 590, f"Prediction: {examination.prediction}")
    pdf.drawString(70, 560, f"Confidence: {examination.confidence}%")
    pdf.drawString(70, 530, f"Examination ID: {examination.id}")
    pdf.drawString(70, 500, f"Date: {examination.created_at}")


    pdf.save()

    return FileResponse(
        path=report_path,
        filename=f"sono_ai_report_{examination.id}.pdf",
        media_type="application/pdf"
    )