# BackEnd/Routes/analytics.py

# ─── Analytics & Feedback Routes ───────────────────────────────────────────────

from fastapi import (
    APIRouter, Depends, HTTPException, status, Query, WebSocket
)
from fastapi.responses import StreamingResponse
from fastapi.websockets import WebSocketDisconnect

from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from datetime import datetime
from typing import Optional
import asyncio
import csv
from io import StringIO

from BackEnd.Models.chat_log import ChatLog
from BackEnd.Models.user import User
from BackEnd.Schemas.feedback import FeedbackCreate
from BackEnd.Utils.auth_utils import get_current_user, require_role
from BackEnd.Utils.database import get_db

# ────────────────────────────────────────────────────────────────────────────────
# ── Router Initialization ──────────────────────────────────────────────────────

router = APIRouter(tags=["Analytics"])

# ────────────────────────────────────────────────────────────────────────────────
# ── WebSocket Clients Registry ─────────────────────────────────────────────────

connected_clients = set()

# ────────────────────────────────────────────────────────────────────────────────
# ── Real-Time Feedback Broadcasting ────────────────────────────────────────────

async def notify_clients(feedback_data):
    """
    Broadcast feedback updates to all connected WebSocket clients.

    Args:
        feedback_data (dict): Feedback update payload to broadcast.
    """
    for client in connected_clients:
        await client.send_json(feedback_data)


@router.websocket("/feedback-stream")
async def feedback_stream(websocket: WebSocket):
    """
    WebSocket endpoint for clients to receive live feedback updates.

    Automatically removes disconnected clients.

    Route: /api/auth/analytics/feedback-stream
    """
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

# ────────────────────────────────────────────────────────────────────────────────
# ── Feedback Submission Endpoint ──────────────────────────────────────────────

@router.post("/feedback/", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback for a chatbot response.

    Also triggers real-time notifications for any listening WebSocket clients.

    Returns:
        dict: Confirmation of feedback submission.
    """
    chat_log = db.query(ChatLog).get(feedback_data.chat_log_id)
    if not chat_log:
        raise HTTPException(status_code=404, detail="Chat log not found")

    chat_log.feedback = feedback_data.comment
    chat_log.rating = feedback_data.rating
    db.commit()

    asyncio.create_task(notify_clients({
        "chat_log_id": feedback_data.chat_log_id,
        "rating": feedback_data.rating,
        "timestamp": datetime.utcnow().isoformat()
    }))

    return {"status": "success", "message": "Feedback submitted"}

# ────────────────────────────────────────────────────────────────────────────────
# ── Feedback Analytics Endpoint ───────────────────────────────────────────────

@router.get("/feedback-analytics")
def get_feedback_analytics(db: Session = Depends(get_db)):
    """
    Retrieve summary statistics about user-submitted feedback.

    Returns:
        dict: Total feedback count, average rating, and mock improvement rate.
    """
    total_feedback = db.query(ChatLog).filter(ChatLog.rating.isnot(None)).count()
    avg_rating = db.query(func.avg(ChatLog.rating)).scalar() or 0

    return {
        "total_feedback": total_feedback,
        "average_rating": round(avg_rating, 2),
        "improvement_rate": "45%"  # Placeholder value for now
    }

# ────────────────────────────────────────────────────────────────────────────────
# ── Feedback Export Endpoint (Admin-Only) ──────────────────────────────────────

@router.get("/export-feedback", dependencies=[Depends(require_role("admin"))])
def export_feedback(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    child_id: Optional[str] = Query(None)
):
    """
    Export filtered feedback logs as a downloadable CSV file.

    Filters:
    - start_date (optional)
    - end_date (optional)
    - child_id (optional)

    Returns:
        StreamingResponse: CSV file download.
    """
    query = db.query(ChatLog).filter(ChatLog.rating.isnot(None))

    if start_date:
        query = query.filter(ChatLog.timestamp >= start_date)
    if end_date:
        query = query.filter(ChatLog.timestamp <= end_date)
    if child_id:
        query = query.filter(ChatLog.child_id == child_id)

    feedback_logs = query.all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["User ID", "Child ID", "Rating", "Feedback", "Timestamp"])

    for log in feedback_logs:
        writer.writerow([
            log.user_id,
            log.child_id,
            log.rating,
            log.feedback or "",
            log.timestamp.isoformat() if log.timestamp else ""
        ])

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=feedback.csv"}
    )

# ────────────────────────────────────────────────────────────────────────────────
