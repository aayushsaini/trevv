"""
TravelConnect - Main Application Entry Point

A travel networking micro social media platform.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup: Create database tables
    print("🚀 Starting TravelConnect API...")
    print(f"📊 Features enabled:")
    print(f"   - Cab Sharing: {settings.FEATURE_CAB_SHARING}")
    print(f"   - Flight Tracking: {settings.FEATURE_FLIGHT_TRACKING}")
    print(f"   - Networking: {settings.FEATURE_NETWORKING}")
    print(f"   - Chat: {settings.FEATURE_CHAT}")
    print(f"   - Notifications: {settings.FEATURE_NOTIFICATIONS}")
    print(f"   - AI Matching: {settings.FEATURE_AI_MATCHING}")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    
    # Seed database with sample data
    try:
        from app.seed_data import seed_database
        seed_database()
    except Exception as e:
        print(f"⚠️ Seed skipped: {e}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down TravelConnect API...")


# Create FastAPI application
app = FastAPI(
    title="TravelConnect API",
    description="Travel networking micro social media platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Welcome to TravelConnect API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration."""
    return {
        "status": "healthy",
        "service": "travelconnect-api"
    }

