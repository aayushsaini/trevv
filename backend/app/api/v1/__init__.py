"""
API v1 Router

Aggregates all API routes with feature flag support.
"""
from fastapi import APIRouter

from app.core.config import settings
from app.api.v1 import auth, users, travels, connections, cab_shares, feed, follows, intents, travel_requests

# Create main API router
api_router = APIRouter()

# Always include auth and user routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Include travel routes
api_router.include_router(travels.router, prefix="/travels", tags=["Travel Plans"])

# Include travel requests routes
api_router.include_router(travel_requests.router, prefix="/travel-requests", tags=["Travel Requests"])

# Include feed routes
api_router.include_router(feed.router, prefix="/feed", tags=["Feed"])

# Include intents routes
api_router.include_router(intents.router, prefix="/intents", tags=["Travel Intents"])

# Include follow routes
api_router.include_router(follows.router, prefix="/follows", tags=["Follows"])

# Feature-flagged routes
if settings.FEATURE_NETWORKING:
    api_router.include_router(
        connections.router, prefix="/connections", tags=["Connections"]
    )

if settings.FEATURE_CAB_SHARING:
    api_router.include_router(
        cab_shares.router, prefix="/cab-shares", tags=["Cab Sharing"]
    )

