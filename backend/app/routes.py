from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from . import crud, schemas

# Create router with prefix and tags
router = APIRouter(
    prefix="/applications",
    tags=["applications"]
)

# ✅ Handle GET with and without trailing slash
@router.get("/", response_model=List[schemas.ApplicationResponse])
@router.get("", response_model=List[schemas.ApplicationResponse])
def get_applications(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    applications = crud.get_applications(db, skip=skip, limit=limit)
    return [schemas.ApplicationResponse.from_orm_custom(app) for app in applications]

# ✅ Handle POST with and without trailing slash
@router.post("/", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    db_application = crud.create_application(db, application)
    return schemas.ApplicationResponse.from_orm_custom(db_application)

# These already work with or without trailing slash because of the path parameter
@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return schemas.ApplicationResponse.from_orm_custom(application)

@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(
    application_id: int,
    application_update: schemas.ApplicationUpdate,
    db: Session = Depends(get_db)
):
    updated_application = crud.update_application(db, application_id, application_update)
    if updated_application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return schemas.ApplicationResponse.from_orm_custom(updated_application)

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_application(db, application_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return None