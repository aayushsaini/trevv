"""
Intent Routes

Handles travel intent operations.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.travel_intent import TRAVEL_INTENTS
from app.schemas.travel_intent import IntentInfo


router = APIRouter()


@router.get("/", response_model=List[IntentInfo])
async def list_intents():
    """Get all available travel intents."""
    return [
        IntentInfo(
            key=key,
            icon=info["icon"],
            label=info["label"],
            description=info["description"]
        )
        for key, info in TRAVEL_INTENTS.items()
    ]


@router.get("/categories")
async def get_intent_categories():
    """Get intents grouped by category."""
    return {
        "networking": [
            {"key": "networking", **TRAVEL_INTENTS["networking"]},
            {"key": "coffee", **TRAVEL_INTENTS["coffee"]},
            {"key": "startup_connect", **TRAVEL_INTENTS["startup_connect"]},
        ],
        "travel_buddy": [
            {"key": "co_traveller", **TRAVEL_INTENTS["co_traveller"]},
            {"key": "adventure", **TRAVEL_INTENTS["adventure"]},
            {"key": "food_buddy", **TRAVEL_INTENTS["food_buddy"]},
            {"key": "photography", **TRAVEL_INTENTS["photography"]},
        ],
        "collaboration": [
            {"key": "brand_collab", **TRAVEL_INTENTS["brand_collab"]},
            {"key": "creator_collab", **TRAVEL_INTENTS["creator_collab"]},
        ],
        "practical": [
            {"key": "cab_share", **TRAVEL_INTENTS["cab_share"]},
            {"key": "local_guide", **TRAVEL_INTENTS["local_guide"]},
            {"key": "be_guide", **TRAVEL_INTENTS["be_guide"]},
            {"key": "work_remote", **TRAVEL_INTENTS["work_remote"]},
        ],
        "social": [
            {"key": "just_vibes", **TRAVEL_INTENTS["just_vibes"]},
        ],
    }






