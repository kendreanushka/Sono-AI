# Sono AI

### CNN-Based Breast Ultrasound Image Classifier

Sono AI is a full-stack deep learning application that classifies breast ultrasound images into three categories: **Benign**, **Malignant** and **Normal**.

It combines a **CNN image classifier (EfficientNetB0)**, a **FastAPI backend**, **JWT authentication**, a **MySQL database**, a **React frontend**, and cloud deployment on **Vercel, Render and Aiven**.

> **Important:** Sono AI is an educational/research project. It is **not a medical device** and does not provide a medical diagnosis or replace a qualified medical professional.

---

## Live Application

| Part | URL |
|---|---|
| Frontend (Vercel) | https://sono-ai-nu.vercel.app |
| Backend API (Render) | https://sono-ai-backend-d61c.onrender.com |
| API docs (Swagger) | https://sono-ai-backend-d61c.onrender.com/docs |

> The backend runs on a free-tier host, so the first request after a period of inactivity may be slow.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Project Development Flow](#project-development-flow)
6. [Dataset](#dataset)
7. [Dataset Preparation and Split](#dataset-preparation-and-split)
8. [Image Preprocessing](#image-preprocessing)
9. [Model Development and Training](#model-development-and-training)
10. [Model Evaluation](#model-evaluation)
11. [Prediction Pipeline](#prediction-pipeline)
12. [Backend Development](#backend-development)
13. [JWT Authentication and Password Security](#jwt-authentication-and-password-security)
14. [Database](#database)
15. [PDF Report Generation](#pdf-report-generation)
16. [Frontend Development](#frontend-development)
17. [CORS](#cors)
18. [Deployment](#deployment)
19. [Environment Variables and Security](#environment-variables-and-security)
20. [Project Structure](#project-structure)
21. [API Endpoints](#api-endpoints)
22. [Local Setup](#local-setup)
23. [Limitations](#limitations)
24. [Future Improvements](#future-improvements)
25. [Dataset Reference](#dataset-reference)
26. [Disclaimer](#disclaimer)

---

## Overview

Sono AI is an end-to-end application for breast ultrasound image classification.

The project started with preparing a public breast ultrasound dataset (BUSI) and training CNN classifiers with transfer learning. After comparing MobileNetV2 and EfficientNetB0, **EfficientNetB0** was selected as the final model.

The trained model is integrated into a FastAPI backend that provides image prediction, authentication, examination storage, examination history and PDF report generation. A React/Vite frontend lets a user:

1. Create an account and log in
2. Upload an ultrasound image
3. Get an AI prediction with confidence
4. Save examination details
5. View previous examinations
6. Download a PDF report

---

## Features

**Machine learning**
- Three-class breast ultrasound classification (benign / malignant / normal)
- Transfer learning with a pretrained EfficientNetB0
- Image preprocessing, softmax prediction and confidence output

**Backend**
- FastAPI REST API with Swagger documentation
- Image upload and ML inference
- JWT authentication and protected routes
- Password hashing (Passlib + bcrypt)
- MySQL integration with SQLAlchemy
- Per-user examination history
- PDF report generation
- CORS configuration

**Frontend**
- React + Vite single-page application
- Signup, login and protected pages
- Upload, prediction and confidence display
- Patient/examination form
- Examination history and report download

**Deployment**
- Frontend on Vercel, backend on Render, MySQL on Aiven, code on GitHub

---

## System Architecture

```text
                    +---------------------+
                    |    User / Browser   |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    |   React + Vite      |
                    |   Frontend (Vercel) |
                    +----------+----------+
                               |
                         REST API + JWT
                               |
                               v
                    +---------------------+
                    |   FastAPI Backend   |
                    |      (Render)       |
                    +----+-----+-----+----+
                         |     |     |
              +----------+     |     +-----------+
              v                v                 v
      +---------------+  +-------------+  +---------------+
      | EfficientNetB0|  | MySQL       |  | ReportLab     |
      | (.keras model)|  | (Aiven)     |  | PDF reports   |
      +---------------+  +-------------+  +---------------+
```

The ML model is never exposed directly to the frontend; all requests go through the FastAPI REST API.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Languages | Python, JavaScript |
| Deep learning | TensorFlow / Keras |
| Final model | EfficientNetB0 (ImageNet pretrained) |
| Baseline model | MobileNetV2 |
| Image processing | Pillow, NumPy |
| Evaluation | scikit-learn |
| Backend | FastAPI |
| Authentication | JWT |
| Password hashing | Passlib + bcrypt |
| Database | MySQL |
| ORM | SQLAlchemy |
| Frontend | React.js, Vite, React Router |
| API communication | REST / Fetch API |
| PDF generation | ReportLab |
| Version control | Git / GitHub |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | Aiven |

---

## Project Development Flow

```text
 1. Define the classification problem
 2. Create the project structure
 3. Download the BUSI dataset
 4. Remove mask images, keep ultrasound images
 5. Organize images by class
 6. Create train / validation / test split
 7. Preprocess and augment images
 8. Train and evaluate MobileNetV2 baseline
 9. Train and evaluate EfficientNetB0
10. Select the final model and save it (.keras)
11. Build the prediction module (predict.py)
12. Build the FastAPI backend
13. Add JWT authentication and password hashing
14. Add MySQL database (users, examinations)
15. Add examination history
16. Add PDF report generation
17. Build the React frontend
18. Connect frontend to backend (api.js)
19. Configure CORS
20. Deploy database (Aiven), backend (Render), frontend (Vercel)
21. Test the complete production flow
```

---

## Dataset

Sono AI uses the **Breast Ultrasound Images Dataset (BUSI)**, introduced by Al-Dhabyani et al. It contains breast ultrasound images from 600 female patients in three categories (normal, benign, malignant), with ground-truth segmentation masks.

- **Source:** https://pmc.ncbi.nlm.nih.gov/articles/PMC6906728/
- **Paper:** W. Al-Dhabyani, M. Gomaa, H. Khaled, A. Fahmy, "Dataset of breast ultrasound images," *Data in Brief*, vol. 28, 104863, 2020.

### Data used in this project

Only the original ultrasound images were used (mask images were excluded):

| Class | Images |
|---|---:|
| Benign | 437 |
| Malignant | 210 |
| Normal | 133 |
| **Total** | **780** |

The model was trained on ultrasound images only, not on segmentation masks, because Sono AI performs classification rather than lesion segmentation.

---

## Dataset Preparation and Split

1. Downloaded the BUSI dataset and inspected the class folders.
2. Identified the original ultrasound images and excluded the mask images.
3. Organized the images into `benign/`, `malignant/` and `normal/` folders.
4. Split the data into training, validation and test sets.

| Set | Share | Images |
|---|---:|---:|
| Training | 70% | ~545 |
| Validation | 15% | ~115 |
| Test | 15% | 120 |
| **Total** | **100%** | **780** |

The test set was kept separate and was not used for training. Final results are reported on these **120 held-out images**.

---

## Image Preprocessing

Before reaching the CNN, each image is:

- Converted to RGB
- Resized to **224 x 224**
- Converted to a NumPy array and batched

Training augmentation: horizontal flip, small rotation and small zoom.

---

## Model Development and Training

Instead of training a CNN from scratch, **transfer learning** was used: a pretrained network acts as a feature extractor and a small custom classification head is trained on top.

### MobileNetV2 baseline

```text
Input -> MobileNetV2 (ImageNet) -> GlobalAveragePooling2D
      -> Dense(128, ReLU) -> Dropout(0.3) -> Dense(3, Softmax)
```

Test accuracy: **65.83%**

### EfficientNetB0 (final model)

The same dataset split and a similar training setup were used for a fair comparison.

```text
Input (224 x 224 x 3)
        |
EfficientNetB0 (ImageNet pretrained, frozen)
        |
GlobalAveragePooling2D
        |
Dense(128, ReLU)
        |
Dropout(0.3)
        |
Dense(3, Softmax)
        |
Benign / Malignant / Normal
```

### Training configuration

| Parameter | Value |
|---|---|
| Pretrained weights | ImageNet |
| Input size | 224 x 224 |
| Batch size | 16 |
| Epochs | 8 |
| Optimizer | Adam |
| Learning rate | 0.0001 |
| Hidden activation | ReLU |
| Dropout | 0.3 |
| Output | 3-class Softmax |

### Rejected experiment

A class-weighting + fine-tuning experiment reduced test accuracy to about **53.33%**, so it was not used. The simpler frozen EfficientNetB0 setup performed better.

### Saved model

```text
ml/model/efficientnet_b0_model.keras
```

The backend loads this model at startup.

---

## Model Evaluation

Final evaluation was done on the 120 held-out test images.

**Test accuracy: 74.17%**

| Class | Precision | Recall | F1-score |
|---|---:|---:|---:|
| Benign | 0.8261 | 0.8507 | 0.8382 |
| Malignant | 0.6452 | 0.6250 | 0.6349 |
| Normal | 0.6000 | 0.5714 | 0.5854 |
| **Overall accuracy** | | | **0.7417** |

Macro F1: **0.6862** | Weighted F1: **0.7398**

### Confusion matrix

```text
                   Predicted
                Benign  Malignant  Normal
Actual Benign     57        6         4
Actual Malignant   8       20         4
Actual Normal      4        5        12
```

### Model comparison

| Model | Test accuracy |
|---|---:|
| MobileNetV2 | 65.83% |
| **EfficientNetB0** | **74.17%** |

EfficientNetB0 improved test accuracy by about **8.34 percentage points** over the baseline.

---

## Prediction Pipeline

Implemented in `backend/predict.py`:

```text
User uploads ultrasound image
        -> FastAPI receives the file
        -> Convert to RGB
        -> Resize to 224 x 224
        -> Convert to NumPy array
        -> EfficientNetB0 prediction
        -> Take class with highest probability
        -> Map index to class name
        -> Return prediction + confidence
```

Example response:

```json
{
  "prediction": "benign",
  "confidence": 92.4
}
```

---

## Backend Development

The backend is built with **FastAPI** and connects the frontend, the CNN model, authentication, the database and report generation.

Responsibilities: user registration and login, JWT authentication, image upload, ML inference, examination storage and retrieval, and PDF report generation.

---

## JWT Authentication and Password Security

**Signup:** name, email and password are sent to `POST /auth/signup`; the password is hashed and the user is stored in MySQL.

**Login:** email and password are sent to `POST /auth/login`; the backend finds the user, verifies the password against the stored hash and returns a JWT access token.

The frontend stores the token and sends it with protected requests:

```text
Authorization: Bearer <JWT_TOKEN>
```

**Protected routes:** `POST /predict`, `POST /examinations`, `GET /examinations`, `GET /examinations/{id}`, `GET /examinations/{id}/report`.

The backend extracts the user ID from the token and uses it so that each user can only access their **own** examination records.

**Password security:** plain-text passwords are never stored. Passwords are hashed with Passlib + bcrypt and verified against the stored hash at login.

---

## Database

MySQL hosted on **Aiven**, accessed with **SQLAlchemy**.

```text
users
  id, name, email, password_hash, created_at

examinations
  id, user_id, patient_name, patient_age, patient_gender,
  patient_contact, image_path, prediction, confidence, created_at
```

`examinations.user_id` links each examination to the user who created it. After a prediction, the examination is saved with `POST /examinations`, and the logged-in user's history is read with `GET /examinations`.

---

## PDF Report Generation

`GET /examinations/{examination_id}/report` generates a PDF with **ReportLab** containing patient name, age, gender, contact, AI prediction, confidence, examination ID and date. The frontend receives the PDF and offers it as a download.

---

## Frontend Development

Built with React.js, Vite, React Router, the Fetch API and Lucide React icons.

User flow:

```text
Signup -> Login -> Dashboard -> Upload ultrasound -> AI prediction
       -> Enter / save examination details -> Examination history
       -> View examination -> Download PDF report
```

### Frontend-backend communication

All API calls are centralized in `frontend/src/services/api.js`, which handles signup, login, token storage, prediction, creating and fetching examinations, and report download. This keeps API logic out of the UI components.

Production API base URL:

```javascript
export const API_BASE_URL = "https://sono-ai-backend-d61c.onrender.com";
```

During local development the frontend uses `http://127.0.0.1:8000`.

---

## CORS

Because the frontend and backend are hosted separately, FastAPI's `CORSMiddleware` allows cross-origin requests from:

```text
http://localhost:5173
http://127.0.0.1:5173
https://sono-ai-nu.vercel.app
```

A production issue was fixed here: the deployed frontend was initially calling `127.0.0.1:8000`, which only exists on the developer's machine. Pointing the API base URL to the Render backend and allowing the Vercel origin in CORS fixed it.

---

## Deployment

```text
GitHub
  |-- React frontend  -> Vercel
  |-- FastAPI backend -> Render -> Aiven MySQL
```

- **Vercel:** builds the Vite app with `npm run build` and serves the `dist` output.
- **Render:** runs the FastAPI app and loads the trained EfficientNetB0 model.
- **Aiven:** hosts the MySQL database; the backend connects using environment variables.

---

## Environment Variables and Security

Sensitive values are never committed to GitHub. Locally they live in `.env`, which is listed in `.gitignore`:

```env
DB_USER=your-user
DB_PASSWORD=your-password
DB_HOST=your-host
DB_PORT=your-port
DB_NAME=your-database

SECRET_KEY=your-secret-key
```

In production, secrets such as the JWT `SECRET_KEY` and database settings are configured in Render's environment settings.

Security measures: password hashing, JWT authentication, protected routes, per-user data filtering, secrets in environment variables, `.env` excluded from Git, and CORS restrictions.

Never commit `.env`, database passwords, JWT secret keys or API keys.

---

## Project Structure

```text
Sono-AI/
|-- backend/
|   |-- __init__.py
|   |-- main.py          # FastAPI app, routes, CORS
|   |-- auth.py          # JWT + password hashing
|   |-- database.py      # DB connection / session
|   |-- models.py        # SQLAlchemy models
|   +-- predict.py       # Model loading + inference
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |   +-- api.js   # Centralized API calls
|   |   |-- App.jsx
|   |   +-- main.jsx
|   |-- package.json
|   |-- vite.config.js
|   +-- index.html
|
|-- ml/
|   |-- dataset/split/   # train / validation / test
|   +-- model/
|       +-- efficientnet_b0_model.keras
|
|-- uploads/
|-- .env                 # not committed
|-- .gitignore
|-- requirements.txt
+-- README.md
```

The dataset and other large/generated files are excluded from Git where appropriate.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/auth/signup` | No | Create a new user account |
| POST | `/auth/login` | No | Log in and receive a JWT |
| POST | `/predict` | Yes | Upload an ultrasound image, get prediction + confidence |
| POST | `/examinations` | Yes | Save an examination for the current user |
| GET | `/examinations` | Yes | List the current user's examinations |
| GET | `/examinations/{id}` | Yes | Get a single examination |
| GET | `/examinations/{id}/report` | Yes | Download the PDF report |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/kendreanushka/Sono-AI.git
cd Sono-AI
```

### 2. Backend

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Create a `.env` file (see [Environment Variables and Security](#environment-variables-and-security)), then start the server:

```bash
uvicorn backend.main:app --reload
```

- Backend: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## Limitations

1. **Small dataset:** only 780 images, small for medical imaging.
2. **Class imbalance:** benign, malignant and normal counts are unequal; malignant and normal have noticeably lower F1 than benign.
3. **Limited external generalization:** predictions on images from other sources can differ substantially (domain shift from different machines, hospitals or processing).
4. **No clinical validation:** the model must not be used for real-world diagnosis.
5. **Dataset-level issues:** later research has discussed quality and annotation issues in BUSI, so performance on it should not be read as clinical performance.
6. **Confidence is not certainty:** "Benign - 95%" means the model gave the highest probability to benign, not that there is a clinically verified 95% chance.
7. **Model selection and split:** models were compared on the same held-out test set and the split was not done at patient level, so the reported accuracy may be somewhat optimistic.

---

## Future Improvements

- Larger and more diverse ultrasound datasets
- Patient-level splitting and external validation sets
- Better handling of class imbalance and more hyperparameter tuning
- Fine-tuning and model calibration / uncertainty estimation
- Explainable AI (Grad-CAM) and lesion segmentation
- Image-quality checks and better medical-image preprocessing
- Cloud object storage for uploaded images
- Automated tests and CI/CD
- Monitoring model performance after deployment

---

## Dataset Reference

> Al-Dhabyani, W., Gomaa, M., Khaled, H., & Fahmy, A. Dataset of breast ultrasound images. *Data in Brief*, 28, 104863, 2020.

https://pmc.ncbi.nlm.nih.gov/articles/PMC6906728/

---

## Disclaimer

Sono AI is developed for educational and experimental purposes. It is **not a medical device**, does not provide a medical diagnosis, and must not replace examination, diagnosis or treatment by a qualified healthcare professional. The reported performance reflects evaluation on this project's held-out test set and is not clinical accuracy.

---

**Project:** Sono AI | **Repository:** https://github.com/kendreanushka/Sono-AI
