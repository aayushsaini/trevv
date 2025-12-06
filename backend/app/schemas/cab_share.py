"""
Cab Share Schemas

Pydantic models for cab sharing API operations.
"""
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field


class CabShareBase(BaseModel):
    """Base cab share schema."""
    pickup_location: str = Field(..., max_length=255)
    pickup_coordinates: Optional[str] = None
    dropoff_location: str = Field(..., max_length=255)
    dropoff_coordinates: Optional[str] = None
    pickup_time: datetime
    total_seats: int = Field(default=4, ge=1, le=10)
    available_seats: int = Field(default=3, ge=0, le=10)
    price_per_seat: Optional[Decimal] = None
    notes: Optional[str] = None


class CabShareCreate(CabShareBase):
    """Schema for creating a cab share."""
    travel_plan_id: UUID


class CabShareJoin(BaseModel):
    """Schema for joining a cab share."""
    seats_needed: int = Field(default=1, ge=1, le=5)
    pickup_point: Optional[str] = Field(None, max_length=255)


class CabShareParticipantResponse(BaseModel):
    """Schema for cab share participant."""
    id: UUID
    user_id: UUID
    seats_booked: int
    pickup_point: Optional[str] = None
    is_confirmed: bool
    
    # User info
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    
    class Config:
        from_attributes = True


class CabShareResponse(CabShareBase):
    """Schema for cab share response."""
    id: UUID
    travel_plan_id: UUID
    creator_id: UUID
    is_active: bool
    created_at: datetime
    
    # Creator info
    creator_name: Optional[str] = None
    creator_avatar: Optional[str] = None
    
    # Travel info
    origin: Optional[str] = None
    destination: Optional[str] = None
    travel_date: Optional[datetime] = None
    
    # Participants
    participants: List[CabShareParticipantResponse] = []
    
    class Config:
        from_attributes = True






