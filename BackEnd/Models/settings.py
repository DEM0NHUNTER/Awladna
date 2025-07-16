# BackEnd/Models/settings.py

# ─── Database Model: User Settings ─────────────────────────────────────────────

from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship

from BackEnd.Utils.database import Base

# ────────────────────────────────────────────────────────────────────────────────
# ── UserSettings Model ─────────────────────────────────────────────────────────

class UserSettings(Base):
    """
    SQLAlchemy model representing user-specific customization settings.

    Purpose:
    - Stores theme preferences and language settings per user.
    - Tracks theme customization history for rollback or personalization insights.

    Table: user_settings

    Columns:
    - id: Primary key (autoincrement).
    - user_id: Linked user ID (foreign key).
    - language: UI language preference (default: 'en').
    - theme: JSON object storing primary/secondary color codes and version.
    - theme_history: JSON array tracking previous themes used.

    Relationships:
    - user: Associated User model (back_populates 'settings').
    """

    __tablename__ = "user_settings"

    # ── Primary Key ────────────────────────────────────────────────────────────
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── Foreign Key ────────────────────────────────────────────────────────────
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    # ── Customization Settings ─────────────────────────────────────────────────
    language = Column(String(10), default="en")

    theme = Column(
        JSON,
        default='{"primary": "#3b82f6", "secondary": "#8b5cf6", "version": 1}'
    )

    theme_history = Column(
        JSON,
        default="[]"
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    user = relationship("User", back_populates="settings")

# ────────────────────────────────────────────────────────────────────────────────
