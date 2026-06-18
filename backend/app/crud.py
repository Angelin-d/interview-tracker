from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas

# CREATE: Add a new application
def create_application(db: Session, application: schemas.ApplicationCreate):
    """
    Create a new job application.
    
    Args:
        db: Database session
        application: Application data to create
    
    Returns:
        Created application object
    """
    # Convert Pydantic schema to SQLAlchemy model
    db_application = models.Application(
        company_name=application.company_name,
        role=application.role,
        status=application.status,
        applied_date=application.applied_date,
        interview_date=application.interview_date,
        notes=application.notes
    )
    
    # Add to database and commit
    db.add(db_application)
    db.commit()
    db.refresh(db_application)  # Get the created ID and timestamps
    
    return db_application

# READ: Get all applications
def get_applications(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all applications with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
    
    Returns:
        List of applications
    """
    return db.query(models.Application).offset(skip).limit(limit).all()

# READ: Get a single application by ID
def get_application(db: Session, application_id: int):
    """
    Get a specific application by ID.
    
    Args:
        db: Database session
        application_id: ID of the application to retrieve
    
    Returns:
        Application object or None if not found
    """
    return db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()

# UPDATE: Update an existing application
def update_application(
    db: Session, 
    application_id: int, 
    application_update: schemas.ApplicationUpdate
):
    """
    Update an existing application.
    
    Args:
        db: Database session
        application_id: ID of the application to update
        application_update: New data for the application
    
    Returns:
        Updated application object or None if not found
    """
    # Get the existing application
    db_application = get_application(db, application_id)
    if db_application is None:
        return None
    
    # Update only the fields that were provided
    update_data = application_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_application, field, value)
    
    # Commit the changes
    db.commit()
    db.refresh(db_application)
    
    return db_application

# DELETE: Remove an application
def delete_application(db: Session, application_id: int):
    """
    Delete an application by ID.
    
    Args:
        db: Database session
        application_id: ID of the application to delete
    
    Returns:
        True if deleted, False if not found
    """
    # Get the existing application
    db_application = get_application(db, application_id)
    if db_application is None:
        return False
    
    # Delete from database
    db.delete(db_application)
    db.commit()
    
    return True