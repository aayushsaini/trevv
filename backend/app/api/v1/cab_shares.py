"""
Cab Share Routes

Handles cab sharing offers and bookings.
"""
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.cab_share import CabShareCreate, CabShareResponse, CabShareJoin, CabShareParticipantResponse
from app.services.cab_share_service import CabShareService
from app.services.travel_service import TravelService
from app.services.user_service import UserService


router = APIRouter()


def enrich_cab_share_response(cab_share, db) -> dict:
    """Add creator and travel info to cab share response."""
    user_service = UserService(db)
    creator = user_service.get_by_id(cab_share.creator_id)
    
    # Get travel plan info
    travel = cab_share.travel_plan
    
    # Enrich participants
    participants = []
    for p in cab_share.participants:
        user = user_service.get_by_id(p.user_id)
        participants.append({
            **p.__dict__,
            "user_name": user.name if user else None,
            "user_avatar": user.avatar_url if user else None,
        })
    
    return {
        **cab_share.__dict__,
        "creator_name": creator.name if creator else None,
        "creator_avatar": creator.avatar_url if creator else None,
        "origin": travel.origin if travel else None,
        "destination": travel.destination if travel else None,
        "travel_date": travel.travel_date if travel else None,
        "participants": participants,
    }


@router.get("/", response_model=List[CabShareResponse])
async def list_cab_shares(
    origin: Optional[str] = Query(None, description="Filter by pickup area"),
    destination: Optional[str] = Query(None, description="Filter by dropoff area"),
    date: Optional[datetime] = Query(None, description="Filter by date"),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search available cab shares.
    
    Returns active cab shares with available seats.
    """
    service = CabShareService(db)
    cab_shares = service.search(
        origin=origin,
        destination=destination,
        date=date,
        limit=limit
    )
    
    return [enrich_cab_share_response(cs, db) for cs in cab_shares]


@router.post("/", response_model=CabShareResponse, status_code=status.HTTP_201_CREATED)
async def create_cab_share(
    cab_share_data: CabShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new cab share offer.
    
    - **travel_plan_id**: Link to an existing travel plan
    - **pickup_location**: Where to pick up passengers
    - **dropoff_location**: Final destination (e.g., airport)
    - **pickup_time**: When the cab will depart
    - **available_seats**: Number of seats to share
    - **price_per_seat**: Optional cost per seat
    """
    travel_service = TravelService(db)
    travel = travel_service.get_by_id(cab_share_data.travel_plan_id)
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel plan not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create cab share for your own travel plan"
        )
    
    service = CabShareService(db)
    cab_share = service.create(current_user.id, cab_share_data)
    
    return enrich_cab_share_response(cab_share, db)


@router.get("/my", response_model=List[CabShareResponse])
async def get_my_cab_shares(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get cab shares created by or joined by the current user."""
    service = CabShareService(db)
    cab_shares = service.get_user_cab_shares(current_user.id)
    
    return [enrich_cab_share_response(cs, db) for cs in cab_shares]


@router.get("/{cab_share_id}", response_model=CabShareResponse)
async def get_cab_share(
    cab_share_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific cab share by ID."""
    service = CabShareService(db)
    cab_share = service.get_by_id(cab_share_id)
    
    if not cab_share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cab share not found"
        )
    
    return enrich_cab_share_response(cab_share, db)


@router.post("/{cab_share_id}/join", response_model=CabShareParticipantResponse)
async def join_cab_share(
    cab_share_id: UUID,
    join_data: CabShareJoin,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Join a cab share.
    
    - **seats_needed**: Number of seats you need
    - **pickup_point**: Optional custom pickup location
    """
    service = CabShareService(db)
    cab_share = service.get_by_id(cab_share_id)
    
    if not cab_share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cab share not found"
        )
    
    if not cab_share.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cab share is no longer active"
        )
    
    if cab_share.creator_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot join your own cab share"
        )
    
    if service.check_already_joined(cab_share_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already joined this cab share"
        )
    
    if join_data.seats_needed > cab_share.available_seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {cab_share.available_seats} seats available"
        )
    
    participant = service.join(cab_share, current_user.id, join_data)
    
    return {
        **participant.__dict__,
        "user_name": current_user.name,
        "user_avatar": current_user.avatar_url,
    }






