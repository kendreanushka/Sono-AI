from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    examinations = relationship("Examination", back_populates="user")


class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    patient_name = Column(String(100), nullable=False)
    patient_age = Column(Integer, nullable=False)
    patient_gender = Column(String(20), nullable=False)
    patient_contact = Column(String(20))

    image_path = Column(String(255))
    prediction = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="examinations")
