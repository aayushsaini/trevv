"""
Follow Service

Business logic for follow operations.
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.follow import Follow
from app.models.user import User
from app.schemas.follow import FollowCreate, FollowStats


class FollowService:
    """Service class for follow operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def follow(self, follower_id: UUID, follow_data: FollowCreate) -> Follow:
        """Follow a user."""
        follow = Follow(
            follower_id=follower_id,
            following_id=follow_data.following_id,
            notify_new_travel=follow_data.notify_new_travel,
        )
        
        self.db.add(follow)
        self.db.commit()
        self.db.refresh(follow)
        
        return follow
    
    def unfollow(self, follower_id: UUID, following_id: UUID) -> bool:
        """Unfollow a user."""
        follow = self.db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first()
        
        if follow:
            self.db.delete(follow)
            self.db.commit()
            return True
        return False
    
    def is_following(self, follower_id: UUID, following_id: UUID) -> bool:
        """Check if user is following another user."""
        return self.db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first() is not None
    
    def get_followers(self, user_id: UUID, limit: int = 50) -> List[Follow]:
        """Get followers of a user."""
        return self.db.query(Follow).filter(
            Follow.following_id == user_id
        ).limit(limit).all()
    
    def get_following(self, user_id: UUID, limit: int = 50) -> List[Follow]:
        """Get users that a user is following."""
        return self.db.query(Follow).filter(
            Follow.follower_id == user_id
        ).limit(limit).all()
    
    def get_followers_count(self, user_id: UUID) -> int:
        """Get followers count."""
        return self.db.query(Follow).filter(
            Follow.following_id == user_id
        ).count()
    
    def get_following_count(self, user_id: UUID) -> int:
        """Get following count."""
        return self.db.query(Follow).filter(
            Follow.follower_id == user_id
        ).count()
    
    def get_follow_stats(self, user_id: UUID, viewer_id: Optional[UUID] = None) -> FollowStats:
        """Get follow statistics for a user."""
        followers_count = self.get_followers_count(user_id)
        following_count = self.get_following_count(user_id)
        
        is_following = False
        is_followed_by = False
        
        if viewer_id and viewer_id != user_id:
            is_following = self.is_following(viewer_id, user_id)
            is_followed_by = self.is_following(user_id, viewer_id)
        
        return FollowStats(
            followers_count=followers_count,
            following_count=following_count,
            is_following=is_following,
            is_followed_by=is_followed_by,
        )
    
    def get_following_ids(self, user_id: UUID) -> List[UUID]:
        """Get IDs of users that a user is following."""
        follows = self.db.query(Follow.following_id).filter(
            Follow.follower_id == user_id
        ).all()
        return [f[0] for f in follows]






