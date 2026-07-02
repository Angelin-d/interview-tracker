from typing import Optional, List
from datetime import date, datetime, time
from pydantic import BaseModel, Field, validator

# ============================================
# STATUS MAPPING CONSTANTS
# ============================================

STATUS_MAPPING = {
    # Applied group
    "Applied": "Applied",
    "Recruiter Contact": "Applied",
    
    # Interviewing group
    "Online Assessment": "Interviewing",
    "HR Interview": "Interviewing",
    "Technical Interview": "Interviewing",
    "Final Interview": "Interviewing",
    
    # Offer group
    "Offer Received": "Offer",
    "Offer Accepted": "Offer",
    
    # Rejected group
    "Rejected": "Rejected",
    "Offer Rejected": "Rejected",
    
    # Joined group
    "Joining Date": "Joined",
}

# Event types for validation
EVENT_TYPES = list(STATUS_MAPPING.keys()) + ["Custom Event"]

EVENT_TYPES = [
    "Applied",
    "Recruiter Contact",
    "Online Assessment",
    "Technical Interview",
    "HR Interview",
    "Final Interview",
    "Offer Received",
    "Offer Accepted",
    "Rejected",
    "Offer Rejected",
    "Joining Date",
    "Custom Event"
]


STATUS_MAPPING = {
    "Applied": "Applied",
    "Recruiter Contact": "Applied",
    "Online Assessment": "Interviewing",
    "Technical Interview": "Interviewing",
    "HR Interview": "Interviewing",
    "Final Interview": "Interviewing",
    "Offer Received": "Offer",
    "Offer Accepted": "Offer",
    "Rejected": "Rejected",
    "Offer Rejected": "Rejected",
    "Joining Date": "Joined",
    "Custom Event": None,  # Custom events don't update status
}
class ApplicationBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    status: str = Field(default="Applied")
    dateApplied: date = Field(...)
    notes: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ["Applied", "Interviewing", "Offer", "Rejected"]
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
    @validator('dateApplied')
    def validate_date_applied(cls, v):
        # ✅ New: Validate that date_applied is today's date
        if v != date.today():
            raise ValueError("Applications can only be created using today's date.")
        return v


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    dateApplied: Optional[date] = None
    notes: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ["Applied", "Interviewing", "Offer", "Rejected"]
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v


class ApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    status: str
    dateApplied: str
    notes: Optional[str] = None
    created_at: datetime
    timeline_events: Optional[List['TimelineEventResponse']] = None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_custom(cls, obj, include_events: bool = False):
        result = cls(
            id=obj.id,
            company=obj.company,
            role=obj.role,
            status=obj.status,
            dateApplied=obj.date_applied.isoformat() if obj.date_applied else None,
            notes=obj.notes,
            created_at=obj.created_at,
            timeline_events=None
        )
        
        if include_events and hasattr(obj, 'timeline_events'):
            events = sorted(obj.timeline_events, key=lambda x: (x.event_date, x.event_time or time(0, 0)))
            result.timeline_events = [
                TimelineEventResponse.model_validate(event) for event in events
            ]
        
        return result


# ============================================
# FIXED TIMELINE EVENT SCHEMAS
# ============================================

class TimelineEventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    event_type: str = Field(..., min_length=1, max_length=100)
    event_date: date = Field(...)
    event_time: Optional[time] = None
    notes: Optional[str] = None
    completed: bool = False
    
    @validator('event_type')
    def validate_event_type(cls, v):
        allowed_types = [
            "Applied",
            "Recruiter Contact",
            "Online Assessment",
            "Technical Interview",
            "HR Interview",
            "Final Interview",
            "Offer Received",
            "Offer Accepted",
            "Rejected",
            "Joining Date",
            "Follow Up",
            "Custom Event"
        ]
        if v not in allowed_types:
            raise ValueError(f'Event type must be one of: {", ".join(allowed_types)}')
        return v


class TimelineEventCreate(TimelineEventBase):
    pass


class TimelineEventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    event_type: Optional[str] = Field(None, min_length=1, max_length=100)
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None
    
    @validator('event_type')
    def validate_event_type(cls, v):
        if v is not None:
            allowed_types = [
                "Applied",
                "Recruiter Contact",
                "Online Assessment",
                "Technical Interview",
                "HR Interview",
                "Final Interview",
                "Offer Received",
                "Offer Accepted",
                "Rejected",
                "Joining Date",
                "Follow Up",
                "Custom Event"
            ]
            if v not in allowed_types:
                raise ValueError(f'Event type must be one of: {", ".join(allowed_types)}')
        return v


class TimelineEventResponse(BaseModel):
    id: int
    application_id: int
    title: str
    event_type: str
    event_date: date
    event_time: Optional[time] = None
    notes: Optional[str] = None
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ✅ Forward reference for ApplicationResponse
ApplicationResponse.model_rebuild()


# ============================================
# DASHBOARD SCHEMAS
# ============================================

class DashboardStats(BaseModel):
    """Statistics for the dashboard"""
    total: int
    applied: int
    interviewing: int
    offer: int
    rejected: int
    joined: int


class RecentActivityItem(BaseModel):
    """Recent activity item for the dashboard"""
    id: int
    company: str
    role: str
    status: str
    event: str
    event_date: date


class UpcomingEventItem(BaseModel):
    """Upcoming event item for the dashboard"""
    id: int
    application_id: int
    title: str
    event_date: date
    company: str
    role: str


class TodayEventItem(BaseModel):
    """Today's event item for the dashboard"""
    id: int
    application_id: int
    title: str
    event_date: date
    company: str
    role: str


class RecentOfferItem(BaseModel):
    """Recent offer item for the dashboard"""
    id: int
    company: str
    role: str
    status: str
    offer_date: date


class RecentRejectionItem(BaseModel):
    """Recent rejection item for the dashboard"""
    id: int
    company: str
    role: str
    status: str
    rejection_date: date


class DashboardResponse(BaseModel):
    """Complete dashboard response"""
    stats: DashboardStats
    recent_activity: List[RecentActivityItem] = []
    upcoming_events: List[UpcomingEventItem] = []
    today_events: List[TodayEventItem] = []
    recent_offers: List[RecentOfferItem] = []
    recent_rejections: List[RecentRejectionItem] = []