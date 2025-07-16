# src/models/child_profile.py

# ─── Data Models: Child Profiles ───────────────────────────────────────────────

from typing import Optional
from datetime import date, datetime

from sqlalchemy import SQLModel, Field
from pydantic import validator

# ────────────────────────────────────────────────────────────────────────────────
# ── Base Schema ────────────────────────────────────────────────────────────────

class ChildProfileBase(SQLModel):
    """
    Shared attributes for child profiles (used by multiple schemas).

    Fields:
    - name: Child's name (required, indexed).
    - birth_date: Child's date of birth (used to compute age).
    - gender: Optional gender field.
    - behavioral_patterns: Optional serialized JSON or text describing behavior patterns.
    - emotional_state: Optional serialized JSON or text describing emotional state.
    """

    name: str = Field(..., max_length=100, index=True)
    birth_date: date
    gender: Optional[str] = Field(default=None, max_length=20)
    behavioral_patterns: Optional[str] = None
    emotional_state: Optional[str] = None

# ────────────────────────────────────────────────────────────────────────────────
# ── Database Model ─────────────────────────────────────────────────────────────

class ChildProfile(ChildProfileBase, table=True):
    """
    ORM table definition for storing child profiles in the database.

    Table: child_profiles

    Additional Fields:
    - child_id: Auto-incrementing primary key.
    - user_id: Foreign key referencing associated user.
    - created_at: Profile creation timestamp.
    - updated_at: Optional last updated timestamp.
    """

    __tablename__ = "child_profiles"

    child_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.user_id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

# ────────────────────────────────────────────────────────────────────────────────
# ── Response Schema ────────────────────────────────────────────────────────────

class ChildProfileRead(ChildProfileBase):
    """
    Schema for reading child profile data, including computed age.

    Fields:
    - child_id: Unique profile identifier.
    - user_id: ID of parent user who owns the profile.
    - age: Computed field (derived from birth_date).
    """

    child_id: int
    user_id: int
    age: int  # Not stored in DB; computed dynamically.

    @validator("age", pre=True, always=True)
    def compute_age(cls, v, values):
        """
        Validator that computes age from birth_date at serialization time.
        """
        bd = values.get("birth_date")
        if bd:
            today = date.today()
            age = today.year - bd.year - (
                (today.month, today.day) < (bd.month, bd.day)
            )
            return age
        return 0

# ────────────────────────────────────────────────────────────────────────────────
# ── Input Schemas ──────────────────────────────────────────────────────────────

class ChildProfileCreate(ChildProfileBase):
    """
    Schema for creating a new child profile.
    Inherits all fields from ChildProfileBase.
    """
    pass


class ChildProfileUpdate(SQLModel):
    """
    Schema for updating an existing child profile.

    All fields are optional to support partial updates.
    """

    name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    behavioral_patterns: Optional[str] = None
    emotional_state: Optional[str] = None

# ────────────────────────────────────────────────────────────────────────────────
