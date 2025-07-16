# BackEnd/Schemas/settings.py

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class ThemeHistoryEntry(BaseModel):
    """
    Represents a single entry in the user's theme change history.
    """
    timestamp: datetime
    theme: Dict[str, str]
    scope: str
    action: str
    previous_version: Optional[int] = None
    reverted_to: Optional[int] = None


class UserThemeSchema(BaseModel):
    """
    Schema for user's current theme settings and their versioned history.
    """
    theme: Dict[str, str] = Field(..., description="Current theme settings, including version and scope.")
    theme_history: List[ThemeHistoryEntry] = Field(default_factory=list, description="Versioned theme change history.")
