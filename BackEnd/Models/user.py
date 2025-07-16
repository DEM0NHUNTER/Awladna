# BackEnd/Models/user.py

# ─── Database Model: Users ─────────────────────────────────────────────────────

from enum import Enum

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, text, Enum as SQLEnum
)
from sqlalchemy.orm import relationship

from BackEnd.Utils.database import Base

# ────────────────────────────────────────────────────────────────────────────────
# ── UserRole Enum ──────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    """
    Enumeration of user roles within the application:
    - PARENT: Standard parent user (default).
    - ADMIN: Administrative user with elevated privileges.
    - GUEST: Limited-access user.
    """
    PARENT = "parent"
    ADMIN = "admin"
    GUEST = "guest"

# ────────────────────────────────────────────────────────────────────────────────
# ── User Model ─────────────────────────────────────────────────────────────────

class User(Base):
    """
    SQLAlchemy model representing users in the system.

    Purpose:
    - Stores authentication credentials, role, verification status, and profile settings.
    - Serves as a parent entity for linked child profiles and chat logs.

    Table: users

    Columns:
    - user_id: Primary key.
    - email: Unique email address (used for login).
    - password_hash: Hashed password.
    - role: Role assigned (Enum).
    - created_at: Account creation timestamp.
    - is_verified: Email/account verification flag.
    - verification_token: Optional token for verification processes.

    Relationships:
    - settings: One-to-one link to UserSettings model.
    - children: One-to-many link to ChildProfile models.
    - chat_logs: One-to-many link to ChatLog models.
    """

    __tablename__ = "users"

    # ── Primary Key ────────────────────────────────────────────────────────────
    user_id = Column(Integer, primary_key=True, index=True)

    # ── Credentials and Role ───────────────────────────────────────────────────
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.PARENT, nullable=False)

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at = Column(DateTime, default=text("now()"))

    # ── Relationships ──────────────────────────────────────────────────────────
    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False
    )

    children = relationship(
        "ChildProfile",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    chat_logs = relationship(
        "ChatLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # ── Verification Status ────────────────────────────────────────────────────
    is_verified = Column(Boolean, default=True)
    verification_token = Column(String, nullable=True)

    # ── String Representation ──────────────────────────────────────────────────
    def __repr__(self):
        return (
            f"<User(email={self.email}, role={self.role}, created_at={self.created_at})>"
        )

# ────────────────────────────────────────────────────────────────────────────────
