# BackEnd/Schemas/analytics.py

# ─── Analytics Schemas ──────────────────────────────────────────────────────────

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

# ────────────────────────────────────────────────────────────────────────────────


# ──────────────────────── Feedback Types ────────────────────────────────────────

class FeedbackType(str, Enum):
    """
    Type of feedback based on session context.
    """
    BEHAVIORAL = "behavioral"
    EMOTIONAL = "emotional"
    COMMUNICATION = "communication"
    OTHER = "other"


# ──────────────────────── Base Feedback Schemas ─────────────────────────────────

class FeedbackItem(BaseModel):
    """
    Schema representing a single feedback record.
    """
    chat_log_id: str
    user_id: str
    child_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 (worst) to 5 (best).")
    feedback: Optional[str] = None
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0, description="Sentiment score between -1 and 1.")
    timestamp: datetime


class FeedbackSummary(BaseModel):
    """
    Aggregated summary of feedback metrics.
    """
    total_feedback: int
    average_rating: float
    feedback_rate: float  # % of chats with feedback
    last_updated: datetime


# ──────────────────────── Trend & Stats Schemas ────────────────────────────────

class FeedbackTrendItem(BaseModel):
    """
    Daily or periodic feedback trend item.
    """
    date: str  # Format: YYYY-MM-DD
    count: int
    average_rating: float


class FeedbackTrendResponse(BaseModel):
    """
    Time-based trend analysis of feedback data.
    """
    period: str  # e.g., "30_days"
    trends: List[FeedbackTrendItem]
    overall_change: float  # % change compared to previous period


class ChildFeedbackStats(BaseModel):
    """
    Feedback metrics specific to a child profile.
    """
    child_id: str
    total_feedback: int
    avg_rating: float
    improvement_rate: float
    last_feedback_date: Optional[datetime] = None


# ──────────────────── Recommendation Impact Schemas ────────────────────────────

class RecommendationEffectiveness(BaseModel):
    """
    Effectiveness of AI recommendations based on user feedback.
    """
    recommendation_type: str
    feedback_volume: int
    avg_rating: float
    improvement_rate: float  # % of users reporting improvement
    top_improvement_areas: List[str]


# ──────────────────────── Sentiment Analytics ──────────────────────────────────

class SentimentRatingCorrelation(BaseModel):
    """
    Correlation between sentiment scores and ratings.
    """
    sentiment_category: str  # e.g., "positive", "neutral", "negative"
    avg_rating: float
    feedback_count: int
    improvement_rate: float


# ────────────────────── Admin Dashboard Response ───────────────────────────────

class AdminDashboardStats(BaseModel):
    """
    Full admin dashboard response including all analytic insights.
    """
    feedback_summary: FeedbackSummary
    feedback_trend: FeedbackTrendResponse
    child_stats: List[ChildFeedbackStats]
    recommendation_effectiveness: List[RecommendationEffectiveness]
    sentiment_correlation: List[SentimentRatingCorrelation]
    system_health: Dict[str, str]  # e.g., {"database": "OK", "redis": "OK"}


# ──────────────────────── Exportable Reports ───────────────────────────────────

class FeedbackReportItem(BaseModel):
    """
    Exportable feedback record item for reports.
    """
    chat_log_id: str
    user_email: str
    child_name: str
    rating: int
    feedback: Optional[str] = None
    sentiment_score: float
    context_tags: List[str]
    timestamp: datetime


class FeedbackReportResponse(BaseModel):
    """
    Schema for exported feedback reports (CSV/JSON).
    """
    report_id: str
    generated_at: datetime
    time_range: str  # Format: YYYY-MM-DD_to_YYYY-MM-DD
    total_records: int
    feedback_items: List[FeedbackReportItem]
    summary: Dict[str, float]  # e.g., {"avg_rating": 4.3, "feedback_rate": 72.5}
