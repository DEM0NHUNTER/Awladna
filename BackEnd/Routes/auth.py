# BackEnd/Routes/auth.py

# ─── Authentication & User Management Routes ───────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer
from email_validator import validate_email, EmailNotValidError

from BackEnd.Models.user import User, UserRole
from BackEnd.Utils.database import get_db
from BackEnd.Utils.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token
)
from BackEnd.Utils.config import settings

import logging

# ────────────────────────────────────────────────────────────────────────────────
# ── Router Initialization ──────────────────────────────────────────────────────

router = APIRouter()
logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────────────────────
# ── Token Serializer ───────────────────────────────────────────────────────────

def get_serializer(salt: str):
    """
    Generate a URL-safe serializer for creating verification/reset tokens.

    Args:
        salt (str): Unique salt for token namespacing.

    Returns:
        URLSafeTimedSerializer: Serializer instance.
    """
    return URLSafeTimedSerializer("SECRET_KEY", salt=salt)

# ────────────────────────────────────────────────────────────────────────────────
# ── Pydantic Schemas ───────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str


class ForgotPasswordRequest(BaseModel):
    email: str

# ────────────────────────────────────────────────────────────────────────────────
# ── Registration Endpoint ──────────────────────────────────────────────────────

@router.post("/register")
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new parent user.

    - Normalizes and validates email.
    - Hashes password.
    - Auto-verifies account upon registration.

    Returns:
        dict: Success message.
    """
    try:
        valid = validate_email(user_data.email)
        normalized_email = valid.normalized

        if db.query(User).filter(User.email == normalized_email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user_data.password)

        new_user = User(
            email=normalized_email,
            password_hash=hashed_password,
            role=UserRole.PARENT,
            is_verified=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "Registration successful"}

    except EmailNotValidError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid email address")

    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

# ────────────────────────────────────────────────────────────────────────────────
# ── Login Endpoint ─────────────────────────────────────────────────────────────

@router.post("/login")
async def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and issue JWT tokens.

    - Validates email and password.
    - Generates access and refresh tokens.

    Returns:
        dict: Access & refresh tokens.
    """
    try:
        user = db.query(User).filter(User.email == form_data.email).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token = create_access_token(data={"sub": user.email})
        refresh_token = create_refresh_token(data={"sub": user.email})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# ────────────────────────────────────────────────────────────────────────────────
