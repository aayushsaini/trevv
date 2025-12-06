"""
User Schemas

Pydantic models for user-related API operations.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    profession: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, max_length=100)
    profession: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None
    current_city: Optional[str] = Field(None, max_length=100)
    latitude: Optional[str] = Field(None, max_length=20)
    longitude: Optional[str] = Field(None, max_length=20)
    profile_type: Optional[str] = Field(None, max_length=50)


class UserResponse(BaseModel):
    """Schema for user response."""
    id: UUID
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    profession: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    current_city: Optional[str] = None
    profile_type: Optional[str] = None
    is_verified: bool = False
    created_at: datetime
    
    # Follow stats (populated by API)
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: Optional[str] = None

