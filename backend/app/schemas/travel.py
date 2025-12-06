"""
Travel Plan Schemas

Pydantic models for travel-related API operations.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.travel import TravelType, TravelStatus


class TravelPlanBase(BaseModel):
    """Base travel plan schema."""
    origin: str = Field(..., min_length=1, max_length=100)
    origin_code: Optional[str] = Field(None, max_length=10)
    destination: str = Field(..., min_length=1, max_length=100)
    destination_code: Optional[str] = Field(None, max_length=10)
    travel_date: datetime
    travel_type: TravelType = TravelType.FLIGHT
    flight_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    is_public: str = "public"
    
    # Companion slots - how many people can join (0 = unlimited/solo)
    max_companions: int = 0
    
    # Travel intents
    intents: Optional[List[str]] = None  # List of intent keys
    primary_intent: Optional[str] = None


class TravelPlanCreate(TravelPlanBase):
    """Schema for creating a travel plan."""
    pass


class TravelPlanUpdate(BaseModel):
    """Schema for updating a travel plan."""
    origin: Optional[str] = Field(None, max_length=100)
    origin_code: Optional[str] = Field(None, max_length=10)
    destination: Optional[str] = Field(None, max_length=100)
    destination_code: Optional[str] = Field(None, max_length=10)
    travel_date: Optional[datetime] = None
    travel_type: Optional[TravelType] = None
    flight_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    max_companions: Optional[int] = None
    status: Optional[TravelStatus] = None
    is_public: Optional[str] = None


class TravelIntentInfo(BaseModel):
    """Intent info for response."""
    key: str
    icon: str
    label: str
    is_primary: bool = False


class TravelPlanResponse(TravelPlanBase):
    """Schema for travel plan response."""
    id: UUID
    user_id: UUID
    status: TravelStatus
    created_at: datetime
    updated_at: datetime
    
    # Include user info
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    user_profession: Optional[str] = None
    user_profile_type: Optional[str] = None
    user_bio: Optional[str] = None
    
    # Stats
    cab_share_count: int = 0
    
    # Companion availability
    accepted_companions: int = 0
    spots_available: int = -1  # -1 = unlimited
    is_full: bool = False
    has_requested: bool = False  # Whether current user has requested
    request_status: Optional[str] = None  # Current user's request status
    
    # Intents
    travel_intents: List[TravelIntentInfo] = []
    
    class Config:
        from_attributes = True

