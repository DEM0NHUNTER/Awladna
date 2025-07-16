# BackEnd/Utils/security.py

from fastapi import HTTPException
from datetime import datetime, timedelta
from jose import JWTError, jwt  # For JWT token management
import hashlib  # Simple password hashing
from itsdangerous import URLSafeTimedSerializer  # For email/password token generation
from typing import Optional, Union
from BackEnd.Utils.config import settings

# === Configuration ===
SECRET_KEY = settings.APP_SECRET_KEY
ALGORITHM = "HS256"  # JWT signing algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

# Serializer for generating/verifying URL-safe tokens
serializer = URLSafeTimedSerializer(SECRET_KEY)


# === Password Hashing Utilities ===

def get_password_hash(password: str) -> str:
    """
    Hashes a password using SHA-256.
    (Consider using bcrypt or argon2 in production for better security.)
    """
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies if a plaintext password matches its SHA-256 hash.
    """
    return get_password_hash(plain_password) == hashed_password


# === Access & Refresh Token Generation (JWT) ===

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Creates a JWT access token.
    Includes expiration claim (`exp`).
    """
    to_encode = dict(data) if isinstance(data, dict) else {}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: Union[str, dict] = None, expires_delta: timedelta = None) -> str:
    """
    Creates a JWT refresh token. Accepts either:
    - a dictionary (as JWT payload)
    - a string (usually an email or user identifier)
    Includes expiration claim (`exp`).
    """
    if isinstance(data, str):
        data = {"sub": data}
    elif not isinstance(data, dict):
        data = {}

    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    data["exp"] = expire
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


# === Token Decoding / Verification Utilities ===

def decode_token(token: str) -> dict:
    """
    Decodes a JWT token and returns its payload.
    Raises JWTError if invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise JWTError("Token expired")
    except JWTError:
        raise JWTError("Invalid token")


def validate_refresh_token(token: str) -> str:
    """
    Decodes a refresh token and returns the 'sub' (subject).
    Used to identify the user associated with the token.
    """
    payload = decode_token(token)
    return payload.get("sub")


# === Email Verification & Password Reset Token Handling ===

def generate_verification_token(email: str) -> str:
    """
    Generates a time-limited, URL-safe token for email verification.
    """
    return serializer.dumps(email, salt="email-verification")


def generate_password_reset_token(email: str) -> str:
    """
    Generates a time-limited, URL-safe token for password reset.
    """
    return serializer.dumps(email, salt="password-reset")


def verify_email_token(token: str, max_age: int = 3600) -> Optional[str]:
    """
    Validates the email verification token.
    Returns the email if valid; None otherwise.
    Default max_age is 3600 seconds (1 hour).
    """
    try:
        return serializer.loads(token, salt="email-verification", max_age=max_age)
    except Exception:
        return None


def verify_password_reset_token(token: str, max_age: int = 3600) -> Optional[str]:
    """
    Validates the password reset token.
    Returns the email if valid; None otherwise.
    """
    try:
        return serializer.loads(token, salt="password-reset", max_age=max_age)
    except Exception:
        return None
