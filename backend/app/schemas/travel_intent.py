"""
Travel Intent Schemas

Pydantic models for travel intent API operations.
"""
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel


class IntentInfo(BaseModel):
    """Schema for intent information."""
    key: str
    icon: str
    label: str
    description: str


class TravelIntentCreate(BaseModel):
    """Schema for adding intents to a travel plan."""
    intent_keys: List[str]
    primary_intent: Optional[str] = None


class TravelIntentResponse(BaseModel):
    """Schema for travel intent response."""
    id: UUID
    travel_plan_id: UUID
    intent_key: str
    is_primary: bool
    icon: str
    label: str
    description: str
    
    class Config:
        from_attributes = True






