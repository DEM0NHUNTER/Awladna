# BackEnd/Utils/auth_utils.py

from typing import Optional, cast
from jose import JWTError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from itsdangerous import URLSafeTimedSerializer

from BackEnd.Models.user import User, UserRole
from BackEnd.Utils.database import Session as SessionFactory
from BackEnd.Utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_verification_token,
    verify_email_token,
    decode_token,
)

# OAuth2 dependency to extract token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_email_token_and_mark_verified(token: str) -> Optional[User]:
    """
    Validate email verification token and mark the user as verified.

    Steps:
    1. Decode the token and retrieve email.
    2. Lookup user by email in the database.
    3. Mark the user as verified and clear the token.
    4. Return updated User instance or None if invalid.
    """
    email = verify_email_token(token)
    if not email:
        return None

    db: Session = SessionFactory()
    try:
        user: Optional[User] = db.query(User).filter(User.email == email).first()
        if user is None:
            return None
        user.is_verified = True
        user.verification_token = None
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def register_user(email: str, password: str) -> Optional[User]:
    """
    Register a new user:
    - If email already exists, return None.
    - Otherwise, create unverified user with hashed password and verification token.
    """
    db: Session = SessionFactory()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"[ERROR] Email {email!r} already registered!")
            return None

        verification_token = generate_verification_token(email)

        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.PARENT,
            is_verified=False,
            verification_token=verification_token,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"[REGISTERED] {email!r}")
        print(f"[INFO] Verification token: {verification_token}")
        return user

    finally:
        db.close()


def login_user(email: str, password: str) -> tuple[Optional[str], Optional[str]]:
    """
    Authenticate user credentials:
    - Validate email and password.
    - Must be verified.
    - Return (access_token, refresh_token) or (None, None) if failed.
    """
    db: Session = SessionFactory()
    try:
        user = db.query(User).filter(User.email == email).first()
    finally:
        db.close()

    if not user or not verify_password(password, user.password_hash):
        print("[LOGIN FAILED] Invalid credentials.")
        return None, None

    if not user.is_verified:
        print("[LOGIN FAILED] Email not verified.")
        return None, None

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token(user.email)
    return access_token, refresh_token


def authenticate_user(email: str) -> User:
    """
    Load and return a verified user from the database.
    Raises Exception if user not found or not verified.
    """
    db: Session = SessionFactory()
    try:
        user = db.query(User).filter(User.email == email).first()
    finally:
        db.close()

    if user is None or not user.is_verified:
        raise Exception("[ERROR] User not verified or does not exist.")

    return cast(User, user)


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    FastAPI dependency: Parse token and retrieve associated user.
    Raises HTTPException on failure.
    """
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    db: Session = SessionFactory()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        db.close()


def require_role(required_role: UserRole):
    """
    Role-based authorization dependency.
    Ensures the current user has the required role.
    Example:
        @app.get("/admin-only", dependencies=[Depends(require_role(UserRole.ADMIN))])
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have required role: {required_role}"
            )
        return current_user

    return role_checker


def access_protected_resource(token: str) -> None:
    """
    Example utility to validate a token.
    Prints success message if valid, otherwise logs failure.
    """
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        print(f"[ACCESS GRANTED] Valid token for {sub!r}.")
    except Exception as e:
        print(f"[ACCESS DENIED] {e}")
