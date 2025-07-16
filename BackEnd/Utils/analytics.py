# BackEnd/Utils/analytics.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, List
from BackEnd.Models.chat_log import ChatLog
import logging
import math

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


def get_feedback_summary(db: Session) -> Dict:
    """
    Get high-level feedback metrics across all chats.
    Returns total feedback count, average rating, and percentage feedback rate.
    """
    total_feedback = db.query(func.count(ChatLog.id)).filter(ChatLog.rating.isnot(None)).scalar() or 0
    avg_rating = db.query(func.avg(ChatLog.rating)).filter(ChatLog.rating.isnot(None)).scalar() or 0

    total_chats = db.query(func.count(ChatLog.id)).scalar() or 1

    return {
        "total_feedback": total_feedback,
        "average_rating": round(avg_rating, 2),
        "feedback_rate": round((total_feedback / total_chats) * 100, 1)
    }


def calculate_feedback_trend(db: Session, days: int = 30) -> Dict[str, List]:
    """
    Calculate daily feedback counts over the last 'days' period.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    feedback_logs = db.query(ChatLog).filter(
        ChatLog.rating.isnot(None),
        ChatLog.timestamp.between(start_date, end_date)
    ).order_by(ChatLog.timestamp).all()

    daily_counts = {}
    for log in feedback_logs:
        date_key = log.timestamp.strftime("%Y-%m-%d")
        daily_counts[date_key] = daily_counts.get(date_key, 0) + 1

    sorted_dates = sorted(daily_counts.keys())

    return {
        "dates": sorted_dates,
        "counts": [daily_counts[date] for date in sorted_dates]
    }


def get_sentiment_correlation(db: Session) -> Dict[str, float]:
    """
    Calculate Pearson correlation coefficient between sentiment_score and rating.
    Returns {"correlation": float}.
    """
    logs = db.query(ChatLog).filter(
        ChatLog.rating.isnot(None),
        ChatLog.sentiment_score.isnot(None)
    ).all()

    if not logs:
        return {"correlation": 0.0}

    ratings = [log.rating for log in logs]
    sentiments = [log.sentiment_score for log in logs]

    n = len(ratings)
    sum_x = sum(ratings)
    sum_y = sum(sentiments)
    sum_xy = sum(x * y for x, y in zip(ratings, sentiments))
    sum_x2 = sum(x ** 2 for x in ratings)
    sum_y2 = sum(y ** 2 for y in sentiments)

    numerator = (n * sum_xy) - (sum_x * sum_y)
    denominator = math.sqrt((n * sum_x2 - sum_x ** 2) * (n * sum_y2 - sum_y ** 2))

    correlation = (numerator / denominator) if denominator != 0 else 0.0

    return {"correlation": round(correlation, 2)}


def get_child_feedback_stats(db: Session) -> List[Dict]:
    """
    Retrieve aggregated feedback stats per child profile.
    """
    results = db.query(
        ChatLog.child_id,
        func.count(ChatLog.id).filter(ChatLog.rating.isnot(None)).label("total_feedback"),
        func.avg(ChatLog.rating).label("avg_rating")
    ).group_by(ChatLog.child_id).all()

    return [
        {
            "child_id": str(child_id),
            "total_feedback": total,
            "avg_rating": round(avg, 2) if avg is not None else 0.0
        }
        for child_id, total, avg in results
    ]


def analyze_recommendation_effectiveness(db: Session) -> Dict:
    """
    Estimate effectiveness of recommendations via improvement trends in recent feedback.
    Uses simple consecutive session improvement counts.
    """
    recent_feedback = db.query(ChatLog).filter(
        ChatLog.rating.isnot(None),
        ChatLog.timestamp > datetime.utcnow() - timedelta(days=90)
    ).order_by(ChatLog.timestamp.asc()).all()

    improvement_count = sum(
        1 for i in range(1, len(recent_feedback))
        if recent_feedback[i].rating > recent_feedback[i - 1].rating
    )

    improvement_rate = round(
        (improvement_count / len(recent_feedback)) * 100, 1
    ) if recent_feedback else 0

    return {
        "improvement_rate": f"{improvement_rate}%",
        "feedback_volume": len(recent_feedback),
        "top_improvement_areas": [
            "bedtime_routine",
            "emotional_support",
            "behavior_management"
        ]
    }
