"""
Travel Plan Model

Represents a user's travel plans in the platform.
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class TravelType(str, Enum):
    """Types of travel."""
    FLIGHT = "flight"
    TRAIN = "train"
    BUS = "bus"
    CAR = "car"
    OTHER = "other"


class TravelStatus(str, Enum):
    """Status of a travel plan."""
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TravelPlan(Base):
    """Travel plan model for tracking user journeys."""
    
    __tablename__ = "travel_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Route information
    origin = Column(String(100), nullable=False, index=True)
    origin_code = Column(String(10), nullable=True)  # Airport/station code
    destination = Column(String(100), nullable=False, index=True)
    destination_code = Column(String(10), nullable=True)
    
    # Travel details
    travel_date = Column(DateTime, nullable=False, index=True)
    travel_type = Column(SQLEnum(TravelType), default=TravelType.FLIGHT)
    flight_number = Column(String(20), nullable=True)
    
    # Companion slots - how many people can join this journey
    max_companions = Column(Integer, default=0)  # 0 = no limit or solo travel
    
    # Additional info
    notes = Column(Text, nullable=True)
    status = Column(SQLEnum(TravelStatus), default=TravelStatus.PLANNED)
    
    # Visibility
    is_public = Column(String(10), default="public")  # public, connections, private
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="travel_plans")
    cab_shares = relationship("CabShare", back_populates="travel_plan", cascade="all, delete-orphan")
    requests = relationship("TravelRequest", back_populates="travel", cascade="all, delete-orphan")
    
    @property
    def accepted_companions_count(self):
        """Count of accepted travel requests."""
        from app.models.travel_request import RequestStatus
        return len([r for r in self.requests if r.status == RequestStatus.ACCEPTED])
    
    @property
    def spots_available(self):
        """Number of spots still available."""
        if self.max_companions == 0:
            return -1  # Unlimited
        return max(0, self.max_companions - self.accepted_companions_count)
    
    @property
    def is_full(self):
        """Check if all companion spots are filled."""
        if self.max_companions == 0:
            return False
        return self.accepted_companions_count >= self.max_companions
    
    def __repr__(self):
        return f"<TravelPlan {self.origin} -> {self.destination} on {self.travel_date}>"


