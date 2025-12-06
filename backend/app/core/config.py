"""
Application Configuration

Centralized settings management using Pydantic Settings.
Supports environment variables and .env files.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "TravelConnect"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "travelconnect"
    POSTGRES_PASSWORD: str = "travelconnect"
    POSTGRES_DB: str = "travelconnect"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Feature Flags
    FEATURE_CAB_SHARING: bool = True
    FEATURE_FLIGHT_TRACKING: bool = True
    FEATURE_NETWORKING: bool = True
    FEATURE_CHAT: bool = True
    FEATURE_NOTIFICATIONS: bool = True
    FEATURE_AI_MATCHING: bool = False
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL from components."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()






