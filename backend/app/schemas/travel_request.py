"""
Travel Request Schemas

Pydantic models for travel request (companion join) operations.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

from app.models.travel_request import RequestStatus


class TravelRequestCreate(BaseModel):
    """Schema for creating a travel request."""
    travel_id: UUID
    message: Optional[str] = None


class TravelRequestUpdate(BaseModel):
    """Schema for updating a travel request status."""
    status: RequestStatus


class TravelRequestResponse(BaseModel):
    """Schema for travel request response."""
    id: UUID
    travel_id: UUID
    requester_id: UUID
    message: Optional[str] = None
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime] = None
    
    # Requester info
    requester_name: Optional[str] = None
    requester_avatar: Optional[str] = None
    requester_profession: Optional[str] = None
    requester_profile_type: Optional[str] = None
    
    # Travel info
    travel_origin: Optional[str] = None
    travel_destination: Optional[str] = None
    travel_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True





