from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, validator

# Base schema with common fields
class ApplicationBase(BaseModel):
    """
    Base schema with fields common to all application schemas.
    Matches the frontend's expected JSON structure.
    """
    company: str = Field(..., min_length=1, max_length=255, description="Company name")
    role: str = Field(..., min_length=1, max_length=255, description="Job role/title")
    status: str = Field(default="Applied", description="Application status")
    dateApplied: date = Field(..., description="Date when application was submitted (YYYY-MM-DD)")
    notes: Optional[str] = Field(None, description="Additional notes about the application")
    
    @validator('status')
    def validate_status(cls, v):
        """
        Validate that status is one of the allowed values.
        Frontend expects exactly: Applied, Interviewing, Offer, Rejected
        """
        allowed_statuses = ["Applied", "Interviewing", "Offer", "Rejected"]
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
    @validator('dateApplied')
    def validate_date_applied(cls, v):
        """
        Validate that dateApplied is not in the future.
        """
        if v > date.today():
            raise ValueError('Applied date cannot be in the future')
        return v

# Schema for creating a new application
class ApplicationCreate(ApplicationBase):
    """
    Schema for creating a new application.
    All fields except notes are required.
    """
    pass

# Schema for updating an existing application
class ApplicationUpdate(BaseModel):
    """
    Schema for updating an existing application.
    All fields are optional for updates.
    """
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None)
    dateApplied: Optional[date] = Field(None)
    notes: Optional[str] = Field(None)
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ["Applied", "Interviewing", "Offer", "Rejected"]
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v

# Schema for returning an application
class ApplicationResponse(BaseModel):
    """
    Schema for returning an application from the API.
    Converts date_applied to dateApplied as string.
    """
    id: int
    company: str
    role: str
    status: str
    dateApplied: str  # Returned as string in YYYY-MM-DD format
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_custom(cls, obj):
        """
        Custom factory method to convert ORM object to response schema.
        Handles the date_applied to dateApplied conversion.
        """
        return cls(
            id=obj.id,
            company=obj.company,
            role=obj.role,
            status=obj.status,
            dateApplied=obj.date_applied.isoformat() if obj.date_applied else None,
            notes=obj.notes,
            created_at=obj.created_at
        )