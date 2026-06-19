from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas

# CREATE: Add a new application
def create_application(db: Session, application: schemas.ApplicationCreate):
    """
    Create a new job application.
    Maps dateApplied (frontend) to date_applied (database).
    """
    db_application = models.Application(
        company=application.company,
        role=application.role,
        status=application.status,
        date_applied=application.dateApplied,  # Map frontend field to database column
        notes=application.notes
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application

# READ: Get all applications
def get_applications(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all applications with pagination.
    """
    return db.query(models.Application).offset(skip).limit(limit).all()

# READ: Get a single application by ID
def get_application(db: Session, application_id: int):
    """
    Get a specific application by ID.
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
    Maps dateApplied (frontend) to date_applied (database) if provided.
    """
    # Get the existing application
    db_application = get_application(db, application_id)
    if db_application is None:
        return None
    
    # Update only the fields that were provided
    update_data = application_update.model_dump(exclude_unset=True)
    
    # Map dateApplied to date_applied for database
    if 'dateApplied' in update_data:
        update_data['date_applied'] = update_data.pop('dateApplied')
    
    for field, value in update_data.items():
        setattr(db_application, field, value)
    
    db.commit()
    db.refresh(db_application)
    
    return db_application

# DELETE: Remove an application
def delete_application(db: Session, application_id: int):
    """
    Delete an application by ID.
    """
    db_application = get_application(db, application_id)
    if db_application is None:
        return False
    
    db.delete(db_application)
    db.commit()
    
    return True