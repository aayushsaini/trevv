"""
Travel Request Model

Represents requests from users to join a travel plan as a companion.
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class RequestStatus(str, Enum):
    """Status of a travel request."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    CANCELLED = "cancelled"


class TravelRequest(Base):
    """Model for travel companion requests."""
    
    __tablename__ = "travel_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    travel_id = Column(UUID(as_uuid=True), ForeignKey("travel_plans.id"), nullable=False)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Request details
    message = Column(Text, nullable=True)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
    
    # Relationships
    travel = relationship("TravelPlan", back_populates="requests")
    requester = relationship("User", foreign_keys=[requester_id])
    
    def __repr__(self):
        return f"<TravelRequest {self.requester_id} -> {self.travel_id}>"





