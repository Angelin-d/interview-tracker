from sqlalchemy import Column, Integer, String, Date, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class Application(Base):
    """
    SQLAlchemy model for job applications.
    This defines the database table structure.
    """
    __tablename__ = "applications"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Application details
    company_name = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="Applied")
    
    # Dates
    applied_date = Column(Date, nullable=False)
    interview_date = Column(Date, nullable=True)
    
    # Additional information
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Application(id={self.id}, company='{self.company_name}', role='{self.role}')>"