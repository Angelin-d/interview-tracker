from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey, Boolean, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="Applied")
    date_applied = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # ✅ Fix: Proper relationship with back_populates
    timeline_events = relationship("TimelineEvent", back_populates="application", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Application(id={self.id}, company='{self.company}', role='{self.role}')>"


class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    event_type = Column(String(100), nullable=False, index=True)
    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=True)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # ✅ Fix: Proper relationship with back_populates
    application = relationship("Application", back_populates="timeline_events")
    
    def __repr__(self):
        return f"<TimelineEvent(id={self.id}, title='{self.title}', application_id={self.application_id})>"