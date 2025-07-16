# BackEnd/Schemas/feedback.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    """
    Schema for submitting feedback on a chat log.
    """
    chat_log_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5.")
    comment: Optional[str] = ""
    timestamp: Optional[datetime] = None
