"""
Travel Intent Model

Represents travel intents/tags that users can select for their journey.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


# Predefined intent categories
TRAVEL_INTENTS = {
    "networking": {
        "icon": "👥",
        "label": "Open for Networking",
        "description": "Meet professionals & expand your network"
    },
    "coffee": {
        "icon": "☕",
        "label": "Grab a Coffee",
        "description": "Casual meetup for coffee & conversation"
    },
    "co_traveller": {
        "icon": "🎒",
        "label": "Looking for Co-traveller",
        "description": "Find someone to travel together"
    },
    "cab_share": {
        "icon": "🚕",
        "label": "Cab Sharing",
        "description": "Share a cab to save costs"
    },
    "office_commute": {
        "icon": "🏢",
        "label": "Office Commute",
        "description": "Daily commute buddy to office"
    },
    "brand_collab": {
        "icon": "🤝",
        "label": "Brand Collaborations",
        "description": "Open to brand deals & partnerships"
    },
    "creator_collab": {
        "icon": "🎬",
        "label": "Creator Collab",
        "description": "Looking to collaborate with creators"
    },
    "startup_connect": {
        "icon": "🚀",
        "label": "Startup Networking",
        "description": "Connect with founders & investors"
    },
    "local_guide": {
        "icon": "🗺️",
        "label": "Need Local Guide",
        "description": "Looking for local tips & guidance"
    },
    "be_guide": {
        "icon": "🧭",
        "label": "Can Be Your Guide",
        "description": "Happy to show you around"
    },
    "food_buddy": {
        "icon": "🍽️",
        "label": "Food Buddy",
        "description": "Explore local cuisine together"
    },
    "adventure": {
        "icon": "⛰️",
        "label": "Adventure Partner",
        "description": "Looking for adventure activities"
    },
    "work_remote": {
        "icon": "💻",
        "label": "Remote Work Buddy",
        "description": "Co-working space companion"
    },
    "photography": {
        "icon": "📸",
        "label": "Photography Partner",
        "description": "Explore & capture moments together"
    },
    "just_vibes": {
        "icon": "✨",
        "label": "Just Good Vibes",
        "description": "Open to meeting cool people"
    },
}


class TravelPlanIntent(Base):
    """Many-to-many relationship between travel plans and intents."""
    
    __tablename__ = "travel_plan_intents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    travel_plan_id = Column(UUID(as_uuid=True), ForeignKey("travel_plans.id"), nullable=False)
    intent_key = Column(String(50), nullable=False)  # Key from TRAVEL_INTENTS
    is_primary = Column(Boolean, default=False)  # Primary intent highlighted
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<TravelPlanIntent {self.travel_plan_id} - {self.intent_key}>"

