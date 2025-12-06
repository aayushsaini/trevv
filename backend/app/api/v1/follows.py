"""
Follow Routes

Handles user follow operations.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.follow import FollowCreate, FollowResponse, FollowStats
from app.services.follow_service import FollowService
from app.services.user_service import UserService


router = APIRouter()


def enrich_follow_response(follow, user) -> dict:
    """Add user info to follow response."""
    return {
        **follow.__dict__,
        "user_name": user.name if user else None,
        "user_avatar": user.avatar_url if user else None,
        "user_profession": user.profession if user else None,
        "user_bio": user.bio if user else None,
    }


@router.post("/", response_model=FollowResponse, status_code=status.HTTP_201_CREATED)
async def follow_user(
    follow_data: FollowCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Follow a user."""
    if follow_data.following_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    service = FollowService(db)
    user_service = UserService(db)
    
    # Check if user exists
    target_user = user_service.get_by_id(follow_data.following_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already following
    if service.is_following(current_user.id, follow_data.following_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user"
        )
    
    follow = service.follow(current_user.id, follow_data)
    return enrich_follow_response(follow, target_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfollow a user."""
    service = FollowService(db)
    
    if not service.unfollow(current_user.id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not following this user"
        )


@router.get("/stats/{user_id}", response_model=FollowStats)
async def get_follow_stats(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get follow statistics for a user."""
    service = FollowService(db)
    return service.get_follow_stats(user_id, current_user.id)


@router.get("/followers", response_model=List[FollowResponse])
async def get_my_followers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users who follow the current user."""
    service = FollowService(db)
    user_service = UserService(db)
    
    followers = service.get_followers(current_user.id)
    
    result = []
    for follow in followers:
        user = user_service.get_by_id(follow.follower_id)
        result.append(enrich_follow_response(follow, user))
    
    return result


@router.get("/following", response_model=List[FollowResponse])
async def get_my_following(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users that the current user is following."""
    service = FollowService(db)
    user_service = UserService(db)
    
    following = service.get_following(current_user.id)
    
    result = []
    for follow in following:
        user = user_service.get_by_id(follow.following_id)
        result.append(enrich_follow_response(follow, user))
    
    return result






