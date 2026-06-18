from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, validator

# Base schema with common fields
class ApplicationBase(BaseModel):
    """Base schema with fields common to all application schemas"""
    company_name: str = Field(..., min_length=1, max_length=255, description="Company name")
    role: str = Field(..., min_length=1, max_length=255, description="Job role/title")
    status: str = Field(default="Applied", description="Application status")
    applied_date: date = Field(..., description="Date when application was submitted")
    interview_date: Optional[date] = Field(None, description="Date of interview (if any)")
    notes: Optional[str] = Field(None, description="Additional notes about the application")
    
    @validator('status')
    def validate_status(cls, v):
        """Validate that status is one of the allowed values"""
        allowed_statuses = ["Applied", "OA", "Interview", "Rejected", "Offer"]
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
    @validator('applied_date')
    def validate_applied_date(cls, v):
        """Validate that applied_date is not in the future"""
        if v > date.today():
            raise ValueError('Applied date cannot be in the future')
        return v

# Schema for creating a new application
class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application"""
    pass

# Schema for updating an existing application
class ApplicationUpdate(BaseModel):
    """Schema for updating an existing application (all fields optional)"""
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None)
    applied_date: Optional[date] = Field(None)
    interview_date: Optional[date] = Field(None)
    notes: Optional[str] = Field(None)
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ["Applied", "OA", "Interview", "Rejected", "Offer"]
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v

# Schema for returning an application (includes all fields)
class Application(ApplicationBase):
    """Schema for returning an application from the API"""
    id: int
    created_at: datetime
    
    class Config:
        # Enable ORM mode to work with SQLAlchemy models
        from_attributes = True