"""
Connection Schemas

Pydantic models for networking/connection API operations.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

from app.models.connection import ConnectionStatus


class ConnectionBase(BaseModel):
    """Base connection schema."""
    message: Optional[str] = None
    context: Optional[str] = None  # travel, profession, cab_share


class ConnectionCreate(ConnectionBase):
    """Schema for creating a connection request."""
    addressee_id: UUID
    travel_plan_id: Optional[UUID] = None


class ConnectionUpdate(BaseModel):
    """Schema for updating connection status."""
    status: ConnectionStatus


class ConnectionResponse(ConnectionBase):
    """Schema for connection response."""
    id: UUID
    requester_id: UUID
    addressee_id: UUID
    status: ConnectionStatus
    travel_plan_id: Optional[UUID] = None
    created_at: datetime
    
    # Include user info for the other party
    other_user_name: Optional[str] = None
    other_user_avatar: Optional[str] = None
    other_user_profession: Optional[str] = None
    other_user_company: Optional[str] = None
    
    class Config:
        from_attributes = True






