"""
Feed Routes

Handles the main travel feed and discovery.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.travel_request import TravelRequest, RequestStatus
from app.schemas.travel import TravelPlanResponse
from app.services.travel_service import TravelService
from app.services.follow_service import FollowService


router = APIRouter()


def enrich_travel_response(travel, user, db=None, current_user_id=None) -> dict:
    """Add user info and companion availability to travel plan response."""
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
        "max_companions": getattr(travel, 'max_companions', 0) or 0,
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
    
    if db:
        service = TravelService(db)
        result["travel_intents"] = service.get_intents(travel.id)
        
        # Get accepted companions count
        accepted_count = db.query(TravelRequest).filter(
            TravelRequest.travel_id == travel.id,
            TravelRequest.status == RequestStatus.ACCEPTED
        ).count()
        
        result["accepted_companions"] = accepted_count
        max_companions = getattr(travel, 'max_companions', 0) or 0
        
        if max_companions > 0:
            result["spots_available"] = max(0, max_companions - accepted_count)
            result["is_full"] = accepted_count >= max_companions
        else:
            result["spots_available"] = -1
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
async def get_feed(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    intent: Optional[str] = Query(None, description="Filter by intent key"),
    city: Optional[str] = Query(None, description="Filter by city"),
    following_only: bool = Query(False, description="Only show from followed users"),
    show_full: bool = Query(True, description="Include journeys that are full"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the main travel feed with filters.
    
    - **intent**: Filter by travel intent (e.g., cab_share, networking)
    - **city**: Filter by origin or destination city (uses user's current_city if not specified)
    - **following_only**: Only show travels from followed users
    - **show_full**: Include journeys that are already full
    """
    service = TravelService(db)
    follow_service = FollowService(db)
    
    following_ids = None
    if following_only:
        following_ids = follow_service.get_following_ids(current_user.id)
    
    # Use user's current city if no city filter specified
    effective_city = city
    if not city and current_user.current_city:
        effective_city = current_user.current_city
    
    travels = service.get_feed(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
        intent_filter=intent,
        city_filter=effective_city,
        following_only=following_only,
        following_ids=following_ids
    )
    
    results = [enrich_travel_response(t, t.user, db, current_user.id) for t in travels]
    
    # Filter out full journeys if requested
    if not show_full:
        results = [r for r in results if not r.get("is_full", False)]
    
    return results


@router.get("/nearby", response_model=List[TravelPlanResponse])
async def get_nearby_travelers(
    origin: str = Query(..., description="Your origin city/code"),
    destination: str = Query(..., description="Your destination city/code"),
    date: datetime = Query(..., description="Your travel date"),
    radius_hours: int = Query(24, description="Time window in hours"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Find travelers with similar routes.
    """
    service = TravelService(db)
    travels = service.search(
        origin=origin,
        destination=destination,
        travel_date=date,
        date_range_hours=radius_hours,
        exclude_user_id=current_user.id
    )
    
    return [enrich_travel_response(t, t.user, db, current_user.id) for t in travels]


@router.get("/in-city/{city}", response_model=List[TravelPlanResponse])
async def get_travelers_in_city(
    city: str,
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get travelers in a specific city.
    
    Uses location API data to show people traveling to/from same city.
    """
    service = TravelService(db)
    travels = service.get_nearby_travelers(
        city=city,
        user_id=current_user.id,
        limit=limit
    )
    
    return [enrich_travel_response(t, t.user, db, current_user.id) for t in travels]


@router.get("/search", response_model=List[TravelPlanResponse])
async def search_travels(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search travels by destination, origin, or user name.
    """
    service = TravelService(db)
    travels = service.search_by_query(
        query=q,
        user_id=current_user.id,
        limit=limit
    )
    
    return [enrich_travel_response(t, t.user, db, current_user.id) for t in travels]

