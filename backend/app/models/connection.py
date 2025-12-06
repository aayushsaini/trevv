"""
Connection Model

Represents professional connections between users.
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ConnectionStatus(str, Enum):
    """Status of a connection request."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Connection(Base):
    """Connection model for user networking."""
    
    __tablename__ = "connections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Users involved
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    addressee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Connection details
    status = Column(SQLEnum(ConnectionStatus), default=ConnectionStatus.PENDING)
    message = Column(Text, nullable=True)  # Optional connection message
    
    # Context - how they connected
    context = Column(String(50), nullable=True)  # e.g., "travel", "profession", "cab_share"
    travel_plan_id = Column(UUID(as_uuid=True), ForeignKey("travel_plans.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Connection {self.requester_id} -> {self.addressee_id} ({self.status})>"






