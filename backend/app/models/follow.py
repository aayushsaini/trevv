"""
Follow Model

Represents follow relationships between users.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Follow(Base):
    """Follow relationship between users."""
    
    __tablename__ = "follows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # The user who is following
    follower_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # The user being followed
    following_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Notification preferences
    notify_new_travel = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Ensure unique follow relationships
    __table_args__ = (
        UniqueConstraint('follower_id', 'following_id', name='unique_follow'),
    )
    
    def __repr__(self):
        return f"<Follow {self.follower_id} -> {self.following_id}>"






