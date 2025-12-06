"""
User Model

Represents a user in the TravelConnect platform.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """User model for authentication and profile management."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    profession = Column(String(100), nullable=True)
    company = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    
    # Location coordinates for proximity matching
    current_city = Column(String(100), nullable=True)
    latitude = Column(String(20), nullable=True)
    longitude = Column(String(20), nullable=True)
    
    # Profile type for better matching
    profile_type = Column(String(50), nullable=True)  # creator, founder, traveler, professional
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    travel_plans = relationship("TravelPlan", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"

