"""
Travel Requests API

Endpoints for managing travel companion requests.
"""
from datetime import datetime
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.travel import TravelPlan
from app.models.travel_request import TravelRequest, RequestStatus
from app.schemas.travel_request import (
    TravelRequestCreate,
    TravelRequestUpdate,
    TravelRequestResponse,
)


router = APIRouter()


def enrich_request_response(request: TravelRequest, db: Session) -> dict:
    """Add user and travel info to request response."""
    requester = db.query(User).filter(User.id == request.requester_id).first()
    travel = db.query(TravelPlan).filter(TravelPlan.id == request.travel_id).first()
    
    return {
        "id": request.id,
        "travel_id": request.travel_id,
        "requester_id": request.requester_id,
        "message": request.message,
        "status": request.status,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
        "responded_at": request.responded_at,
        "requester_name": requester.name if requester else None,
        "requester_avatar": requester.avatar_url if requester else None,
        "requester_profession": requester.profession if requester else None,
        "requester_profile_type": requester.profile_type if requester else None,
        "travel_origin": travel.origin if travel else None,
        "travel_destination": travel.destination if travel else None,
        "travel_date": travel.travel_date if travel else None,
    }


@router.post("/", response_model=TravelRequestResponse)
def create_travel_request(
    request_data: TravelRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Request to join a travel as a companion."""
    # Check if travel exists
    travel = db.query(TravelPlan).filter(TravelPlan.id == request_data.travel_id).first()
    if not travel:
        raise HTTPException(status_code=404, detail="Travel not found")
    
    # Can't request to join own travel
    if travel.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot request to join your own travel")
    
    # Check if already requested
    existing = db.query(TravelRequest).filter(
        TravelRequest.travel_id == request_data.travel_id,
        TravelRequest.requester_id == current_user.id,
        TravelRequest.status.in_([RequestStatus.PENDING, RequestStatus.ACCEPTED])
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending or accepted request")
    
    # Check if travel is full
    if travel.is_full:
        raise HTTPException(status_code=400, detail="This journey is full")
    
    # Create request
    request = TravelRequest(
        travel_id=request_data.travel_id,
        requester_id=current_user.id,
        message=request_data.message,
    )
    
    db.add(request)
    db.commit()
    db.refresh(request)
    
    return enrich_request_response(request, db)


@router.get("/my-requests", response_model=List[TravelRequestResponse])
def get_my_requests(
    status_filter: RequestStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get requests I've sent to join travels."""
    query = db.query(TravelRequest).filter(TravelRequest.requester_id == current_user.id)
    
    if status_filter:
        query = query.filter(TravelRequest.status == status_filter)
    
    requests = query.order_by(TravelRequest.created_at.desc()).all()
    return [enrich_request_response(r, db) for r in requests]


@router.get("/received", response_model=List[TravelRequestResponse])
def get_received_requests(
    status_filter: RequestStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get requests received for my travels."""
    # Get all my travel IDs
    my_travel_ids = [t.id for t in db.query(TravelPlan).filter(TravelPlan.user_id == current_user.id).all()]
    
    if not my_travel_ids:
        return []
    
    query = db.query(TravelRequest).filter(TravelRequest.travel_id.in_(my_travel_ids))
    
    if status_filter:
        query = query.filter(TravelRequest.status == status_filter)
    
    requests = query.order_by(TravelRequest.created_at.desc()).all()
    return [enrich_request_response(r, db) for r in requests]


@router.put("/{request_id}/accept", response_model=TravelRequestResponse)
def accept_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept a travel companion request."""
    request = db.query(TravelRequest).filter(TravelRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if current user owns the travel
    travel = db.query(TravelPlan).filter(TravelPlan.id == request.travel_id).first()
    if travel.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this request")
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only accept pending requests")
    
    # Check if travel is full
    if travel.is_full:
        raise HTTPException(status_code=400, detail="Journey is already full")
    
    request.status = RequestStatus.ACCEPTED
    request.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    
    return enrich_request_response(request, db)


@router.put("/{request_id}/decline", response_model=TravelRequestResponse)
def decline_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Decline a travel companion request."""
    request = db.query(TravelRequest).filter(TravelRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if current user owns the travel
    travel = db.query(TravelPlan).filter(TravelPlan.id == request.travel_id).first()
    if travel.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to decline this request")
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only decline pending requests")
    
    request.status = RequestStatus.DECLINED
    request.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    
    return enrich_request_response(request, db)


@router.delete("/{request_id}")
def cancel_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a travel request I made."""
    request = db.query(TravelRequest).filter(TravelRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.requester_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
    
    if request.status == RequestStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Cannot cancel an accepted request")
    
    request.status = RequestStatus.CANCELLED
    db.commit()
    
    return {"message": "Request cancelled"}





