"""
User Routes

Handles user profile management and search.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService


router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get the current authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile."""
    service = UserService(db)
    updated_user = service.update(current_user, user_data)
    return updated_user


@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: Optional[str] = Query(None, description="Search query for name, profession, or company"),
    profession: Optional[str] = Query(None, description="Filter by profession"),
    limit: int = Query(20, le=100, description="Maximum results to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for users.
    
    - **q**: Search query (matches name, profession, company)
    - **profession**: Filter by specific profession
    - **limit**: Maximum number of results (default: 20, max: 100)
    """
    service = UserService(db)
    users = service.search(query=q, profession=profession, limit=limit)
    
    # Exclude current user from results
    users = [u for u in users if u.id != current_user.id]
    
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a user's public profile by ID."""
    service = UserService(db)
    user = service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user






