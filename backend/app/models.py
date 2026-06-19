from sqlalchemy import Column, Integer, String, Date, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class Application(Base):
    """
    SQLAlchemy model for job applications.
    Maps to the 'applications' table in PostgreSQL.
    """
    __tablename__ = "applications"
    
    # Primary key - auto-generated integer
    id = Column(Integer, primary_key=True, index=True)
    
    # Application fields - match frontend expectations
    company = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="Applied")
    date_applied = Column(Date, nullable=False)  # Stored as DATE in PostgreSQL
    notes = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Application(id={self.id}, company='{self.company}', role='{self.role}')>"