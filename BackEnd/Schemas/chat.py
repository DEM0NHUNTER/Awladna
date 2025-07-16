# BackEnd/Schemas/chat.py

# ─── Chat Schemas ───────────────────────────────────────────────────────────────

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class ChatRequest(BaseModel):
    """
    Request payload for AI chat processing.
    """
    child_id: int
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    """
    AI chat response including metadata.
    """
    response: str
    suggested_actions: List[str] = []
    sentiment: str
    timestamp: datetime


class ConversationHistory(BaseModel):
    """
    Historical record of chat interactions.
    """
    timestamp: datetime
    chatbot_response: str
    context: Optional[str] = None
    sentiment: float  # -1.0 to 1.0 sentiment score
