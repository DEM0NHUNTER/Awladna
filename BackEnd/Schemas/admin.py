# BackEnd/Schemas/admin.py

# ─── Admin Dashboard Schemas ───────────────────────────────────────────────────

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

# ────────────────────────────────────────────────────────────────────────────────


class FeedbackReportItem(BaseModel):
    """
    Schema for individual feedback records used in reports.
    """
    chat_log_id: str
    user_id: str
    child_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5.")
    feedback: Optional[str] = None
    timestamp: datetime


class FeedbackStatsResponse(BaseModel):
    """
    Aggregated feedback statistics.
    """
    total_feedback: int
    average_rating: float
    feedback_rate: float  # Percentage of chats that received feedback


class FeedbackTrendResponse(BaseModel):
    """
    Time-based trend of feedback submissions.
    """
    dates: List[str]
    counts: List[int]


class SentimentCorrelationResponse(BaseModel):
    """
    Sentiment score correlation with ratings.
    Pearson correlation coefficient.
    """
    correlation: float


class ChildFeedbackStatsResponse(BaseModel):
    """
    Child-specific feedback statistics.
    """
    child_id: str
    total_feedback: int
    avg_rating: float


class RecommendationEffectivenessResponse(BaseModel):
    """
    Measures how effective AI recommendations are in improving user outcomes.
    """
    improvement_rate: str  # Example: "45%"
    feedback_volume: int
    top_improvement_areas: List[str]


class AdminUserOverview(BaseModel):
    """
    User base summary for admin dashboard.
    Includes active/total users, growth rate, and feedback distribution.
    """
    total_users: int
    active_users: int
    user_growth_rate: float  # Percentage growth
    avg_feedback_per_user: float
    child_profiles: Dict[str, int]  # {child_id: feedback_count}


class AdminDashboardResponse(BaseModel):
    """
    Full admin dashboard response schema aggregating all relevant reports.
    """
    feedback_stats: FeedbackStatsResponse
    feedback_trend: FeedbackTrendResponse
    child_stats: List[ChildFeedbackStatsResponse]
    recommendation_effectiveness: RecommendationEffectivenessResponse
    sentiment_correlation: SentimentCorrelationResponse
    user_overview: AdminUserOverview
