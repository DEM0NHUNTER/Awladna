# BackEnd/Schemas/child_profile.py

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Dict, List, Any, Union
from enum import Enum


# -------------------------------
# Child Profile Schemas
# -------------------------------

class ChildProfileBase(BaseModel):
    name: str
    gender: str
    age: int
    behavioral_patterns: Dict[str, Any]
    emotional_state: Dict[str, Any]


class ChildProfileCreate(ChildProfileBase):
    pass


class ChildProfileResponse(BaseModel):
    child_id: int
    user_id: int
    name: str
    age: int
    gender: str
    behavioral_patterns: Dict[str, str]
    emotional_state: Dict[str, str]
    created_at: datetime

    model_config = {"from_attributes": True}


# -------------------------------
# Recommendation Enums
# -------------------------------

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    UNSPECIFIED = "unspecified"


class RecommendationSource(str, Enum):
    PEDIATRICIAN = "pediatrician"
    AI_MODEL = "ai_model"
    PARENT_COMMUNITY = "parent_community"
    EDUCATOR = "educator"


class RecommendationPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# -------------------------------
# Recommendation Schemas
# -------------------------------

class RecommendationBase(BaseModel):
    title: str
    description: str
    priority: RecommendationPriority = RecommendationPriority.MEDIUM
    source: RecommendationSource = RecommendationSource.AI_MODEL
    effective_date: date
    expiration_date: Optional[date] = None
    type: str  # e.g., "behavior" or "emotional"
    metadata: Optional[str] = None

    model_config = {"from_attributes": True}


class BehaviorRecommendation(RecommendationBase):
    behavior_target: str = Field(..., example="tantrums")
    expected_outcome: str
    steps: List[str] = Field(..., min_length=1)
    scientific_basis: Optional[str] = None


class EmotionalRecommendation(RecommendationBase):
    emotion_target: str = Field(..., example="anxiety")
    activities: List[str]
    expected_timeline: str


class RecommendationUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    priority: Optional[RecommendationPriority]
    source: Optional[RecommendationSource]
    effective_date: Optional[date]
    expiration_date: Optional[date]
    type: Optional[str]
    metadata: Optional[str]


class RecommendationAnalysis(BaseModel):
    recommendation_id: int
    child_id: int
    effectiveness_score: float = Field(..., ge=0, le=1)
    parent_feedback: Optional[str] = None
    actual_outcome: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)


class BulkRecommendationResponse(BaseModel):
    accepted: int
    rejected: int
    recommendations: List[Union[BehaviorRecommendation, EmotionalRecommendation]]
