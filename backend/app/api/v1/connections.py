"""
Connection Routes

Handles networking and connection requests.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.connection import ConnectionStatus
from app.schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from app.services.connection_service import ConnectionService
from app.services.user_service import UserService


router = APIRouter()


def enrich_connection_response(connection, current_user_id, db) -> dict:
    """Add other user info to connection response."""
    user_service = UserService(db)
    
    # Determine which user is the "other" user
    other_user_id = (
        connection.addressee_id 
        if connection.requester_id == current_user_id 
        else connection.requester_id
    )
    other_user = user_service.get_by_id(other_user_id)
    
    return {
        **connection.__dict__,
        "other_user_name": other_user.name if other_user else None,
        "other_user_avatar": other_user.avatar_url if other_user else None,
        "other_user_profession": other_user.profession if other_user else None,
        "other_user_company": other_user.company if other_user else None,
    }


@router.get("/", response_model=List[ConnectionResponse])
async def list_connections(
    status: Optional[ConnectionStatus] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all connections for the current user."""
    service = ConnectionService(db)
    connections = service.get_user_connections(current_user.id, status=status)
    
    return [enrich_connection_response(c, current_user.id, db) for c in connections]


@router.get("/pending", response_model=List[ConnectionResponse])
async def list_pending_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending connection requests for the current user."""
    service = ConnectionService(db)
    connections = service.get_pending_requests(current_user.id)
    
    return [enrich_connection_response(c, current_user.id, db) for c in connections]


@router.post("/request", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def send_connection_request(
    connection_data: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a connection request.
    
    - **addressee_id**: User ID to connect with
    - **message**: Optional message with the request
    - **context**: How you're connecting (travel, profession, cab_share)
    """
    service = ConnectionService(db)
    
    # Can't connect with yourself
    if connection_data.addressee_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send connection request to yourself"
        )
    
    # Check if connection already exists
    existing = service.check_existing_connection(
        current_user.id, connection_data.addressee_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection already exists or pending"
        )
    
    # Verify addressee exists
    user_service = UserService(db)
    addressee = user_service.get_by_id(connection_data.addressee_id)
    if not addressee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    connection = service.create(current_user.id, connection_data)
    return enrich_connection_response(connection, current_user.id, db)


@router.put("/{connection_id}/accept", response_model=ConnectionResponse)
async def accept_connection(
    connection_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a connection request."""
    service = ConnectionService(db)
    connection = service.get_by_id(connection_id)
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found"
        )
    
    # Only addressee can accept
    if connection.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to accept this request"
        )
    
    if connection.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection request is not pending"
        )
    
    updated = service.update_status(connection, ConnectionStatus.ACCEPTED)
    return enrich_connection_response(updated, current_user.id, db)


@router.put("/{connection_id}/reject", response_model=ConnectionResponse)
async def reject_connection(
    connection_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a connection request."""
    service = ConnectionService(db)
    connection = service.get_by_id(connection_id)
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found"
        )
    
    # Only addressee can reject
    if connection.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reject this request"
        )
    
    updated = service.update_status(connection, ConnectionStatus.REJECTED)
    return enrich_connection_response(updated, current_user.id, db)






