"""
Follow Schemas

Pydantic models for follow API operations.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class FollowCreate(BaseModel):
    """Schema for following a user."""
    following_id: UUID
    notify_new_travel: bool = True


class FollowResponse(BaseModel):
    """Schema for follow response."""
    id: UUID
    follower_id: UUID
    following_id: UUID
    notify_new_travel: bool
    created_at: datetime
    
    # User info
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    user_profession: Optional[str] = None
    user_bio: Optional[str] = None
    
    class Config:
        from_attributes = True


class FollowStats(BaseModel):
    """Schema for follow statistics."""
    followers_count: int
    following_count: int
    is_following: bool = False
    is_followed_by: bool = False






