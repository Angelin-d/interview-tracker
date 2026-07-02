from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from . import crud, schemas

router = APIRouter(
    prefix="/applications",
    tags=["applications"]
)

# ============================================
# 1. DASHBOARD ROUTE - MUST BE FIRST!
# ============================================

@router.get("/dashboard", response_model=schemas.DashboardResponse, tags=["dashboard"])
def get_dashboard(db: Session = Depends(get_db)):
    """
    Get all dashboard data in a single response.
    
    Returns:
    - stats: Application statistics
    - recent_activity: Recent timeline events
    - upcoming_events: Events in the next 14 days
    - today_events: Events happening today
    - recent_offers: Recent offers
    - recent_rejections: Recent rejections
    """
    return crud.get_dashboard_data(db)


# ============================================
# 2. APPLICATION ROUTES
# ============================================

@router.get("/", response_model=List[schemas.ApplicationResponse])
@router.get("", response_model=List[schemas.ApplicationResponse])
def get_applications(
    skip: int = 0, 
    limit: int = 100,
    include_timeline: bool = False,
    db: Session = Depends(get_db)
):
    applications = crud.get_applications(db, skip=skip, limit=limit)
    return [schemas.ApplicationResponse.from_orm_custom(app, include_events=include_timeline) for app in applications]


@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def get_application(
    application_id: int,
    include_timeline: bool = False,
    db: Session = Depends(get_db)
):
    application = crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return schemas.ApplicationResponse.from_orm_custom(application, include_events=include_timeline)


@router.post("/", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    db_application = crud.create_application(db, application)
    return schemas.ApplicationResponse.from_orm_custom(db_application)


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


# ============================================
# 3. TIMELINE ROUTES
# ============================================

@router.get("/{application_id}/timeline", response_model=List[schemas.TimelineEventResponse])
def get_application_timeline(
    application_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    application = crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    events = crud.get_timeline_events_by_application(db, application_id, skip=skip, limit=limit)
    return events if events else []


@router.post("/{application_id}/timeline", response_model=schemas.TimelineEventResponse, status_code=status.HTTP_201_CREATED)
def create_timeline_event(
    application_id: int,
    event: schemas.TimelineEventCreate,
    db: Session = Depends(get_db)
):
    application = crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    db_event = crud.create_timeline_event(db, event, application_id)
    return db_event


@router.put("/timeline/{event_id}", response_model=schemas.TimelineEventResponse)
def update_timeline_event(
    event_id: int,
    event_update: schemas.TimelineEventUpdate,
    db: Session = Depends(get_db)
):
    updated_event = crud.update_timeline_event(db, event_id, event_update)
    if updated_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    return updated_event


@router.patch("/timeline/{event_id}/toggle-completed", response_model=schemas.TimelineEventResponse)
def toggle_timeline_event_completed(
    event_id: int,
    db: Session = Depends(get_db)
):
    updated_event = crud.toggle_timeline_event_completed(db, event_id)
    if updated_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    return updated_event


@router.delete("/timeline/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeline_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_timeline_event(db, event_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found"
        )
    return None