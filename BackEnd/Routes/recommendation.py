# BackEnd/Routes/recommendations.py

# ─── Recommendations API Routes ────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

# Models
from BackEnd.Models.user import User
from BackEnd.Models.recommendation import Recommendation
from BackEnd.Models.child_profile import ChildProfile

# Schemas
from BackEnd.Schemas.child_profile import RecommendationBase, RecommendationUpdate

# Utilities
from BackEnd.Utils.auth_utils import get_current_user
from BackEnd.Utils.database import get_db

# ────────────────────────────────────────────────────────────────────────────────

router = APIRouter(tags=["Recommendations"])

# ────────────────────────────────────────────────────────────────────────────────
# ── Create Recommendation ──────────────────────────────────────────────────────

@router.post("/", response_model=RecommendationBase)
def create_recommendation(
    recommendation: RecommendationBase,
    child_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a recommendation manually for a specific child.
    """
    child = db.query(ChildProfile).filter(
        ChildProfile.child_id == child_id,
        ChildProfile.user_id == current_user.user_id,
    ).first()

    if not child:
        raise HTTPException(status_code=403, detail="Not authorized")

    rec = Recommendation(
        child_id=child_id,
        title=recommendation.title,
        description=recommendation.description,
        source=recommendation.source,
        priority=recommendation.priority,
        effective_date=recommendation.effective_date,
        expiration_date=recommendation.expiration_date,
        type=recommendation.type,
        metadata=recommendation.metadata,
    )

    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

# ────────────────────────────────────────────────────────────────────────────────
# ── Get Recommendations ────────────────────────────────────────────────────────

@router.get("/", response_model=List[RecommendationBase])
def get_recommendations(
    child_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch all recommendations for a specific child.
    """
    return db.query(Recommendation).join(ChildProfile).filter(
        Recommendation.child_id == child_id,
        ChildProfile.user_id == current_user.user_id,
    ).order_by(Recommendation.created_at.desc()).all()

# ────────────────────────────────────────────────────────────────────────────────
# ── Update Recommendation ──────────────────────────────────────────────────────

@router.put("/{rec_id}", response_model=RecommendationBase)
def update_recommendation(
    rec_id: int,
    update_data: RecommendationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing recommendation.
    """
    rec = db.query(Recommendation).join(ChildProfile).filter(
        Recommendation.id == rec_id,
        ChildProfile.user_id == current_user.user_id,
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(rec, field, value)

    db.commit()
    db.refresh(rec)
    return rec

# ────────────────────────────────────────────────────────────────────────────────
# ── Delete Recommendation ──────────────────────────────────────────────────────

@router.delete("/{rec_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a recommendation by ID.
    """
    rec = db.query(Recommendation).join(ChildProfile).filter(
        Recommendation.id == rec_id,
        ChildProfile.user_id == current_user.user_id,
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    db.delete(rec)
    db.commit()
