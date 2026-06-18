from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create database engine
# The engine is the core interface to the database
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_size=5,  # Number of connections to maintain
    max_overflow=10  # Allow additional connections when needed
)

# Create session factory
# SessionLocal will be used to create database sessions
SessionLocal = sessionmaker(
    autocommit=False,  # Don't auto-commit changes
    autoflush=False,   # Don't auto-flush changes
    bind=engine
)

# Create base class for models
# All model classes will inherit from this
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Dependency function that provides a database session.
    This ensures the session is properly closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()