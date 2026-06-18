from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import crud, schemas, database

# Create router with prefix and tags
router = APIRouter(
    prefix="/applications",
    tags=["applications"]
)

@router.get("/", response_model=List[schemas.Application])
def get_applications(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """
    Get all applications with pagination.
    
    - **skip**: Number of applications to skip (default: 0)
    - **limit**: Maximum number of applications to return (default: 100)
    """
    applications = crud.get_applications(db, skip=skip, limit=limit)
    return applications

@router.get("/{application_id}", response_model=schemas.Application)
def get_application(
    application_id: int,
    db: Session = Depends(database.get_db)
):
    """
    Get a specific application by ID.
    
    - **application_id**: ID of the application to retrieve
    """
    application = crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    return application

@router.post("/", response_model=schemas.Application, status_code=status.HTTP_201_CREATED)
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(database.get_db)
):
    """
    Create a new job application.
    
    - **company_name**: Name of the company
    - **role**: Job title/role
    - **status**: Application status (Applied, OA, Interview, Rejected, Offer)
    - **applied_date**: Date of application
    - **interview_date**: Date of interview (optional)
    - **notes**: Additional notes (optional)
    """
    return crud.create_application(db, application)

@router.put("/{application_id}", response_model=schemas.Application)
def update_application(
    application_id: int,
    application_update: schemas.ApplicationUpdate,
    db: Session = Depends(database.get_db)
):
    """
    Update an existing application.
    
    - **application_id**: ID of the application to update
    - All fields are optional in the request body
    """
    updated_application = crud.update_application(db, application_id, application_update)
    if updated_application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    return updated_application

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(database.get_db)
):
    """
    Delete an application by ID.
    
    - **application_id**: ID of the application to delete
    """
    deleted = crud.delete_application(db, application_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    return None