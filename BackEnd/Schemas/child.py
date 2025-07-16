# BackEnd/Schemas/child.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict


class ChildCreate(BaseModel):
    """
    Payload for creating a new child profile.
    """
    name: str
    age: int
    gender: str
    behavioral_patterns: Optional[Dict] = {}
    emotional_state: Optional[Dict] = {}


class ChildOut(BaseModel):
    """
    Output schema for returning child profile data.
    """
    child_id: int
    name: str
    age: int
    gender: str
    behavioral_patterns: Optional[Dict] = {}
    emotional_state: Optional[Dict] = {}
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
