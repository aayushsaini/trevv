"""
Travel Service

Business logic for travel plan operations.
"""
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.travel import TravelPlan, TravelStatus, TravelType
from app.models.travel_intent import TravelPlanIntent, TRAVEL_INTENTS
from app.models.user import User
from app.schemas.travel import TravelPlanCreate, TravelPlanUpdate


class TravelService:
    """Service class for travel plan operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, travel_id: UUID) -> Optional[TravelPlan]:
        """Get travel plan by ID."""
        return self.db.query(TravelPlan).filter(TravelPlan.id == travel_id).first()
    
    def get_user_travels(
        self,
        user_id: UUID,
        status: Optional[TravelStatus] = None,
        limit: int = 20
    ) -> List[TravelPlan]:
        """Get all travel plans for a user."""
        query = self.db.query(TravelPlan).filter(TravelPlan.user_id == user_id)
        
        if status:
            query = query.filter(TravelPlan.status == status)
        
        return query.order_by(TravelPlan.travel_date.desc()).limit(limit).all()
    
    def create(self, user_id: UUID, travel_data: TravelPlanCreate) -> TravelPlan:
        """Create a new travel plan with intents."""
        # Extract intents before creating travel
        intents = travel_data.intents or []
        primary_intent = travel_data.primary_intent
        
        travel_dict = travel_data.model_dump(exclude={'intents', 'primary_intent'})
        travel = TravelPlan(user_id=user_id, **travel_dict)
        
        self.db.add(travel)
        self.db.commit()
        self.db.refresh(travel)
        
        # Add intents
        if intents:
            self.add_intents(travel.id, intents, primary_intent)
        
        return travel
    
    def add_intents(
        self, 
        travel_id: UUID, 
        intent_keys: List[str], 
        primary_intent: Optional[str] = None
    ) -> List[TravelPlanIntent]:
        """Add intents to a travel plan."""
        intents = []
        for key in intent_keys:
            if key in TRAVEL_INTENTS:
                intent = TravelPlanIntent(
                    travel_plan_id=travel_id,
                    intent_key=key,
                    is_primary=(key == primary_intent)
                )
                self.db.add(intent)
                intents.append(intent)
        
        self.db.commit()
        return intents
    
    def get_intents(self, travel_id: UUID) -> List[dict]:
        """Get intents for a travel plan with full info."""
        intents = self.db.query(TravelPlanIntent).filter(
            TravelPlanIntent.travel_plan_id == travel_id
        ).all()
        
        result = []
        for intent in intents:
            if intent.intent_key in TRAVEL_INTENTS:
                info = TRAVEL_INTENTS[intent.intent_key]
                result.append({
                    "key": intent.intent_key,
                    "icon": info["icon"],
                    "label": info["label"],
                    "is_primary": intent.is_primary,
                })
        return result
    
    def update(self, travel: TravelPlan, travel_data: TravelPlanUpdate) -> TravelPlan:
        """Update a travel plan."""
        update_data = travel_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(travel, field, value)
        
        self.db.commit()
        self.db.refresh(travel)
        
        return travel
    
    def delete(self, travel: TravelPlan) -> None:
        """Delete a travel plan."""
        self.db.delete(travel)
        self.db.commit()
    
    def search(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        travel_date: Optional[datetime] = None,
        travel_type: Optional[TravelType] = None,
        date_range_hours: int = 24,
        limit: int = 20,
        exclude_user_id: Optional[UUID] = None
    ) -> List[TravelPlan]:
        """Search travel plans by route and date."""
        query = self.db.query(TravelPlan).filter(
            TravelPlan.is_public == "public",
            TravelPlan.status.in_([TravelStatus.PLANNED, TravelStatus.ACTIVE])
        )
        
        if exclude_user_id:
            query = query.filter(TravelPlan.user_id != exclude_user_id)
        
        if origin:
            query = query.filter(
                or_(
                    TravelPlan.origin.ilike(f"%{origin}%"),
                    TravelPlan.origin_code.ilike(f"%{origin}%")
                )
            )
        
        if destination:
            query = query.filter(
                or_(
                    TravelPlan.destination.ilike(f"%{destination}%"),
                    TravelPlan.destination_code.ilike(f"%{destination}%")
                )
            )
        
        if travel_date:
            date_min = travel_date - timedelta(hours=date_range_hours)
            date_max = travel_date + timedelta(hours=date_range_hours)
            query = query.filter(
                TravelPlan.travel_date.between(date_min, date_max)
            )
        
        if travel_type:
            query = query.filter(TravelPlan.travel_type == travel_type)
        
        return query.order_by(TravelPlan.travel_date.asc()).limit(limit).all()
    
    def get_feed(
        self,
        user_id: Optional[UUID] = None,
        limit: int = 20,
        offset: int = 0,
        intent_filter: Optional[str] = None,
        city_filter: Optional[str] = None,
        following_only: bool = False,
        following_ids: Optional[List[UUID]] = None
    ) -> List[TravelPlan]:
        """Get travel feed - public travel plans with filters."""
        query = self.db.query(TravelPlan).filter(
            TravelPlan.is_public == "public",
            TravelPlan.status.in_([TravelStatus.PLANNED, TravelStatus.ACTIVE]),
            TravelPlan.travel_date >= datetime.utcnow()
        )
        
        # Filter by following
        if following_only and following_ids:
            query = query.filter(TravelPlan.user_id.in_(following_ids))
        
        # Filter by intent
        if intent_filter:
            intent_subq = self.db.query(TravelPlanIntent.travel_plan_id).filter(
                TravelPlanIntent.intent_key == intent_filter
            ).subquery()
            query = query.filter(TravelPlan.id.in_(intent_subq))
        
        # Filter by city (origin or destination)
        if city_filter:
            query = query.filter(
                or_(
                    TravelPlan.origin.ilike(f"%{city_filter}%"),
                    TravelPlan.destination.ilike(f"%{city_filter}%")
                )
            )
        
        return query.order_by(
            TravelPlan.travel_date.asc()
        ).offset(offset).limit(limit).all()
    
    def get_nearby_travelers(
        self,
        city: str,
        user_id: Optional[UUID] = None,
        limit: int = 20
    ) -> List[TravelPlan]:
        """Get travelers in the same city."""
        query = self.db.query(TravelPlan).filter(
            TravelPlan.is_public == "public",
            TravelPlan.status.in_([TravelStatus.PLANNED, TravelStatus.ACTIVE]),
            TravelPlan.travel_date >= datetime.utcnow(),
            or_(
                TravelPlan.origin.ilike(f"%{city}%"),
                TravelPlan.destination.ilike(f"%{city}%")
            )
        )
        
        if user_id:
            query = query.filter(TravelPlan.user_id != user_id)
        
        return query.order_by(TravelPlan.travel_date.asc()).limit(limit).all()
    
    def search_by_query(
        self,
        query: str,
        user_id: Optional[UUID] = None,
        limit: int = 20
    ) -> List[TravelPlan]:
        """Search travels by destination, origin, or user name."""
        search_term = f"%{query}%"
        
        base_query = self.db.query(TravelPlan).join(
            User, TravelPlan.user_id == User.id
        ).filter(
            TravelPlan.is_public == "public",
            TravelPlan.status.in_([TravelStatus.PLANNED, TravelStatus.ACTIVE]),
            TravelPlan.travel_date >= datetime.utcnow(),
            or_(
                TravelPlan.origin.ilike(search_term),
                TravelPlan.origin_code.ilike(search_term),
                TravelPlan.destination.ilike(search_term),
                TravelPlan.destination_code.ilike(search_term),
                User.name.ilike(search_term),
            )
        )
        
        if user_id:
            base_query = base_query.filter(TravelPlan.user_id != user_id)
        
        return base_query.order_by(TravelPlan.travel_date.asc()).limit(limit).all()

