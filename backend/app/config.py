import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings loaded from environment variables"""
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/interview_tracker")
    
    # Application settings
    APP_NAME: str = os.getenv("APP_NAME", "Tech Interview Tracker API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API settings
    API_V1_PREFIX: str = "/api/v1"

# Create a single instance of settings
settings = Settings()