# BackEnd/Models/chat_log.py

# ─── Database Model: Chat Logs ─────────────────────────────────────────────────

from sqlalchemy import Column, Integer, Text, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional

from BackEnd.Utils.database import Base
from BackEnd.Utils.encryption import encrypt_data, decrypt_data

# ────────────────────────────────────────────────────────────────────────────────
# ── ChatLog Model ──────────────────────────────────────────────────────────────

class ChatLog(Base):
    """
    SQLAlchemy model representing chat_logs table.

    Purpose:
    - Stores all chatbot conversations, including user input, AI responses,
      feedback, sentiment analysis, and conversation context.

    Features:
    - Encrypted storage for sensitive user inputs and chatbot responses.
    - Supports indexing for optimized retrieval by user, child, and sentiment.

    Columns:
    - id: Primary key (autoincrement).
    - user_id: Foreign key to associated user.
    - child_id: Foreign key to associated child profile.
    - _user_input: Encrypted user message.
    - _chatbot_response: Encrypted AI response.
    - context: Optional topic or conversation tags.
    - sentiment_score: Numeric sentiment score (-1.0 to 1.0).
    - feedback: Optional user feedback on response.
    - rating: Optional user rating (1-5 stars).
    - timestamp: Message creation time.

    Relationships:
    - Links to ChildProfile and User models.
    """

    __tablename__ = "chat_logs"

    # ── Primary Key ────────────────────────────────────────────────────────────
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── Foreign Keys ────────────────────────────────────────────────────────────
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    child_id = Column(Integer, ForeignKey("child_profiles.child_id"), nullable=False)

    # ── Encrypted Fields ────────────────────────────────────────────────────────
    _user_input = Column("user_input", Text, nullable=False)
    _chatbot_response = Column("chatbot_response", Text, nullable=False)

    # ── Metadata ────────────────────────────────────────────────────────────────
    context = Column(Text)
    sentiment_score = Column(Float)  # Range: -1.0 (negative) to 1.0 (positive)
    feedback = Column(Text)
    rating = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ───────────────────────────────────────────────────────────
    child_profile = relationship("ChildProfile", back_populates="chat_logs")
    user = relationship("User", back_populates="chat_logs")

    # ── Indexes ─────────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_user_child_timestamp", "user_id", "child_id", "timestamp"),
        Index("ix_sentiment_score", "sentiment_score"),
    )

    # ────────────────────────────────────────────────────────────────────────────
    # ── Properties: Encrypted Data Handling ─────────────────────────────────────

    @property
    def user_input(self) -> str:
        """Decrypt and return user input."""
        return decrypt_data(self._user_input) if self._user_input else ""

    @user_input.setter
    def user_input(self, value: str):
        """Encrypt and store user input."""
        self._user_input = encrypt_data(value)

    @property
    def chatbot_response(self) -> str:
        """Decrypt and return chatbot response."""
        return decrypt_data(self._chatbot_response) if self._chatbot_response else ""

    @chatbot_response.setter
    def chatbot_response(self, value: str):
        """Encrypt and store chatbot response."""
        self._chatbot_response = encrypt_data(value)

    # ────────────────────────────────────────────────────────────────────────────
    # ── Utility Methods ─────────────────────────────────────────────────────────

    def get_conversation(self) -> dict:
        """Return the conversation in dictionary form (decrypted)."""
        return {
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "user_input": self.user_input,
            "chatbot_response": self.chatbot_response,
            "sentiment": self.sentiment_score,
            "context": self.context,
        }

    @classmethod
    def create_log(
        cls,
        user_id: int,
        child_id: int,
        user_input: str,
        chatbot_response: str,
        context: Optional[str] = None,
        sentiment_score: Optional[float] = None
    ):
        """
        Factory method to quickly instantiate a new ChatLog entry.
        Encrypts user input and chatbot response automatically.
        """
        log = cls()
        log.user_id = user_id
        log.child_id = child_id
        log.user_input = user_input
        log.chatbot_response = chatbot_response
        log.context = context
        log.sentiment_score = sentiment_score
        return log

# ────────────────────────────────────────────────────────────────────────────────
# ── SentimentMixin (Optional Utility Class) ────────────────────────────────────

class SentimentMixin:
    """
    Mixin providing sentiment classification based on sentiment_score.

    Labels:
    - 'positive' : score >= +0.3
    - 'negative' : score <= -0.3
    - 'neutral'  : score between -0.3 and +0.3
    - 'unknown'  : if sentiment_score is None
    """

    SENTIMENT_THRESHOLDS = {
        "positive": 0.3,
        "negative": -0.3,
        "neutral": 0.0
    }

    sentiment_score: float = None

    def get_sentiment_label(self) -> str:
        """Returns human-readable sentiment label based on score."""
        if self.sentiment_score is None:
            return "unknown"
        if self.sentiment_score >= self.SENTIMENT_THRESHOLDS["positive"]:
            return "positive"
        elif self.sentiment_score <= self.SENTIMENT_THRESHOLDS["negative"]:
            return "negative"
        return "neutral"

# ────────────────────────────────────────────────────────────────────────────────
