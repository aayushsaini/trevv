"""
Travel Plan Routes

Handles travel plan CRUD operations and search.
"""
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.travel import TravelStatus, TravelType
from app.schemas.travel import TravelPlanCreate, TravelPlanUpdate, TravelPlanResponse
from app.services.travel_service import TravelService


router = APIRouter()


def enrich_travel_response(travel, user, db=None, current_user_id=None) -> dict:
    """Add user info and companion status to travel plan response."""
    from app.services.travel_service import TravelService
    from app.models.travel_request import TravelRequest, RequestStatus
    
    # Build response with all required fields explicitly
    result = {
        "id": travel.id,
        "user_id": travel.user_id,
        "origin": travel.origin,
        "origin_code": travel.origin_code,
        "destination": travel.destination,
        "destination_code": travel.destination_code,
        "travel_date": travel.travel_date,
        "travel_type": travel.travel_type,
        "flight_number": travel.flight_number,
        "notes": travel.notes,
        "status": travel.status,
        "is_public": travel.is_public,
        "max_companions": travel.max_companions or 0,
        "created_at": travel.created_at,
        "updated_at": travel.updated_at,
        # User info
        "user_name": user.name if user else None,
        "user_avatar": user.avatar_url if user else None,
        "user_profession": user.profession if user else None,
        "user_profile_type": getattr(user, 'profile_type', None) if user else None,
        "user_bio": user.bio if user else None,
        # Stats
        "cab_share_count": len(travel.cab_shares) if travel.cab_shares else 0,
        "travel_intents": [],
        # Companion availability
        "accepted_companions": 0,
        "spots_available": -1,
        "is_full": False,
        "has_requested": False,
        "request_status": None,
    }
    
    # Calculate companion availability
    if db:
        service = TravelService(db)
        result["travel_intents"] = service.get_intents(travel.id)
        
        # Get accepted companions count
        accepted_count = db.query(TravelRequest).filter(
            TravelRequest.travel_id == travel.id,
            TravelRequest.status == RequestStatus.ACCEPTED
        ).count()
        
        result["accepted_companions"] = accepted_count
        
        if travel.max_companions and travel.max_companions > 0:
            result["spots_available"] = max(0, travel.max_companions - accepted_count)
            result["is_full"] = accepted_count >= travel.max_companions
        else:
            result["spots_available"] = -1  # Unlimited
            result["is_full"] = False
        
        # Check if current user has requested
        if current_user_id:
            user_request = db.query(TravelRequest).filter(
                TravelRequest.travel_id == travel.id,
                TravelRequest.requester_id == current_user_id
            ).order_by(TravelRequest.created_at.desc()).first()
            
            if user_request:
                result["has_requested"] = True
                result["request_status"] = user_request.status.value
    
    return result


@router.get("/", response_model=List[TravelPlanResponse])
async def list_travels(
    origin: Optional[str] = Query(None, description="Filter by origin city/code"),
    destination: Optional[str] = Query(None, description="Filter by destination city/code"),
    travel_date: Optional[datetime] = Query(None, description="Filter by travel date"),
    travel_type: Optional[TravelType] = Query(None, description="Filter by travel type"),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and list travel plans.
    
    Returns public travel plans matching the filters.
    """
    service = TravelService(db)
    travels = service.search(
        origin=origin,
        destination=destination,
        travel_date=travel_date,
        travel_type=travel_type,
        limit=limit,
        exclude_user_id=current_user.id
    )
    
    return [enrich_travel_response(t, t.user, db, current_user.id) for t in travels]


@router.post("/", response_model=TravelPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_travel(
    travel_data: TravelPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new travel plan.
    
    - **origin**: Departure city (e.g., "Bangalore" or "BLR")
    - **destination**: Arrival city
    - **travel_date**: Date and time of travel
    - **travel_type**: flight, train, bus, car, or other
    - **flight_number**: Optional flight/train number
    """
    service = TravelService(db)
    travel = service.create(current_user.id, travel_data)
    
    return enrich_travel_response(travel, current_user, db)


@router.get("/my", response_model=List[TravelPlanResponse])
async def get_my_travels(
    status: Optional[TravelStatus] = Query(None, description="Filter by status"),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's travel plans."""
    service = TravelService(db)
    travels = service.get_user_travels(current_user.id, status=status, limit=limit)
    
    return [enrich_travel_response(t, current_user) for t in travels]


@router.get("/{travel_id}", response_model=TravelPlanResponse)
async def get_travel(
    travel_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific travel plan by ID."""
    service = TravelService(db)
    travel = service.get_by_id(travel_id)
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel plan not found"
        )
    
    return enrich_travel_response(travel, travel.user, db, current_user.id)


@router.put("/{travel_id}", response_model=TravelPlanResponse)
async def update_travel(
    travel_id: UUID,
    travel_data: TravelPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a travel plan (only owner can update)."""
    service = TravelService(db)
    travel = service.get_by_id(travel_id)
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel plan not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this travel plan"
        )
    
    updated_travel = service.update(travel, travel_data)
    return enrich_travel_response(updated_travel, current_user, db)


@router.delete("/{travel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_travel(
    travel_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a travel plan (only owner can delete)."""
    service = TravelService(db)
    travel = service.get_by_id(travel_id)
    
    if not travel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel plan not found"
        )
    
    if travel.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this travel plan"
        )
    
    service.delete(travel)

