"""
Cab Share Service

Business logic for cab sharing operations.
"""
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.cab_share import CabShare, CabShareParticipant
from app.schemas.cab_share import CabShareCreate, CabShareJoin


class CabShareService:
    """Service class for cab share operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, cab_share_id: UUID) -> Optional[CabShare]:
        """Get cab share by ID."""
        return self.db.query(CabShare).filter(CabShare.id == cab_share_id).first()
    
    def get_by_travel_plan(self, travel_plan_id: UUID) -> List[CabShare]:
        """Get cab shares for a travel plan."""
        return self.db.query(CabShare).filter(
            CabShare.travel_plan_id == travel_plan_id,
            CabShare.is_active == True
        ).all()
    
    def create(self, creator_id: UUID, cab_share_data: CabShareCreate) -> CabShare:
        """Create a new cab share offer."""
        cab_share = CabShare(
            creator_id=creator_id,
            **cab_share_data.model_dump()
        )
        
        self.db.add(cab_share)
        self.db.commit()
        self.db.refresh(cab_share)
        
        return cab_share
    
    def join(
        self,
        cab_share: CabShare,
        user_id: UUID,
        join_data: CabShareJoin
    ) -> CabShareParticipant:
        """Join a cab share."""
        participant = CabShareParticipant(
            cab_share_id=cab_share.id,
            user_id=user_id,
            seats_booked=join_data.seats_needed,
            pickup_point=join_data.pickup_point,
        )
        
        # Update available seats
        cab_share.available_seats -= join_data.seats_needed
        
        self.db.add(participant)
        self.db.commit()
        self.db.refresh(participant)
        
        return participant
    
    def search(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        date: Optional[datetime] = None,
        date_range_hours: int = 24,
        limit: int = 20
    ) -> List[CabShare]:
        """Search available cab shares."""
        query = self.db.query(CabShare).filter(
            CabShare.is_active == True,
            CabShare.available_seats > 0,
            CabShare.pickup_time >= datetime.utcnow()
        )
        
        if origin:
            query = query.filter(CabShare.pickup_location.ilike(f"%{origin}%"))
        
        if destination:
            query = query.filter(CabShare.dropoff_location.ilike(f"%{destination}%"))
        
        if date:
            date_min = date - timedelta(hours=date_range_hours)
            date_max = date + timedelta(hours=date_range_hours)
            query = query.filter(
                CabShare.pickup_time.between(date_min, date_max)
            )
        
        return query.order_by(CabShare.pickup_time.asc()).limit(limit).all()
    
    def get_user_cab_shares(self, user_id: UUID) -> List[CabShare]:
        """Get cab shares created by or joined by a user."""
        # Get created cab shares
        created = self.db.query(CabShare).filter(
            CabShare.creator_id == user_id
        ).all()
        
        # Get joined cab shares
        participant_ids = self.db.query(CabShareParticipant.cab_share_id).filter(
            CabShareParticipant.user_id == user_id
        ).subquery()
        
        joined = self.db.query(CabShare).filter(
            CabShare.id.in_(participant_ids)
        ).all()
        
        # Combine and deduplicate
        all_shares = {cs.id: cs for cs in created + joined}
        return list(all_shares.values())
    
    def check_already_joined(self, cab_share_id: UUID, user_id: UUID) -> bool:
        """Check if user already joined a cab share."""
        return self.db.query(CabShareParticipant).filter(
            CabShareParticipant.cab_share_id == cab_share_id,
            CabShareParticipant.user_id == user_id
        ).first() is not None






