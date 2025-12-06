"""
Cab Share Model

Represents cab sharing offers and participants.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Numeric, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class CabShare(Base):
    """Cab share offer model."""
    
    __tablename__ = "cab_shares"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    travel_plan_id = Column(UUID(as_uuid=True), ForeignKey("travel_plans.id"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Location details
    pickup_location = Column(String(255), nullable=False)
    pickup_coordinates = Column(String(50), nullable=True)  # "lat,lng"
    dropoff_location = Column(String(255), nullable=False)
    dropoff_coordinates = Column(String(50), nullable=True)
    
    # Timing
    pickup_time = Column(DateTime, nullable=False)
    
    # Capacity and pricing
    total_seats = Column(Integer, default=4)
    available_seats = Column(Integer, default=3)
    price_per_seat = Column(Numeric(10, 2), nullable=True)
    
    # Additional info
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    travel_plan = relationship("TravelPlan", back_populates="cab_shares")
    participants = relationship("CabShareParticipant", back_populates="cab_share", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<CabShare {self.pickup_location} -> {self.dropoff_location}>"


class CabShareParticipant(Base):
    """Participants in a cab share."""
    
    __tablename__ = "cab_share_participants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cab_share_id = Column(UUID(as_uuid=True), ForeignKey("cab_shares.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Booking details
    seats_booked = Column(Integer, default=1)
    pickup_point = Column(String(255), nullable=True)  # Custom pickup within route
    
    # Status
    is_confirmed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cab_share = relationship("CabShare", back_populates="participants")
    
    def __repr__(self):
        return f"<CabShareParticipant {self.user_id} in {self.cab_share_id}>"






