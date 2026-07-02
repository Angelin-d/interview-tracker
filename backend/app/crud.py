from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, timedelta
from typing import List, Optional
from . import models, schemas

# ============================================
# EXISTING APPLICATION CRUD
# ============================================

def create_application(db: Session, application: schemas.ApplicationCreate):
    db_application = models.Application(
        company=application.company,
        role=application.role,
        status=application.status,
        date_applied=application.dateApplied,
        notes=application.notes
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def get_applications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Application).offset(skip).limit(limit).all()


def get_application(db: Session, application_id: int):
    return db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()


def update_application(db: Session, application_id: int, application_update: schemas.ApplicationUpdate):
    db_application = get_application(db, application_id)
    if db_application is None:
        return None
    
    update_data = application_update.model_dump(exclude_unset=True)
    if 'dateApplied' in update_data:
        update_data['date_applied'] = update_data.pop('dateApplied')
    
    for field, value in update_data.items():
        setattr(db_application, field, value)
    
    db.commit()
    db.refresh(db_application)
    return db_application


def delete_application(db: Session, application_id: int):
    db_application = get_application(db, application_id)
    if db_application is None:
        return False
    db.delete(db_application)
    db.commit()
    return True


# ============================================
# STATUS UPDATE HELPER
# ============================================

def update_application_status(db: Session, application_id: int):
    """Recalculate and update Application.status based on the latest completed Timeline Event."""
    application = get_application(db, application_id)
    if application is None:
        return None
    
    latest_event = db.query(models.TimelineEvent).filter(
        models.TimelineEvent.application_id == application_id,
        models.TimelineEvent.completed == True
    ).order_by(
        desc(models.TimelineEvent.event_date),
        desc(models.TimelineEvent.event_time)
    ).first()
    
    if latest_event is None:
        application.status = "Applied"
    else:
        new_status = schemas.STATUS_MAPPING.get(latest_event.event_type)
        if new_status is not None:
            application.status = new_status
    
    db.commit()
    db.refresh(application)
    return application


# ============================================
# TIMELINE EVENT CRUD
# ============================================

def create_timeline_event(db: Session, event: schemas.TimelineEventCreate, application_id: int):
    application = get_application(db, application_id)
    if application is None:
        return None
    
    db_event = models.TimelineEvent(
        application_id=application_id,
        title=event.title,
        event_type=event.event_type,
        event_date=event.event_date,
        event_time=event.event_time,
        notes=event.notes,
        completed=event.completed
    )
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    update_application_status(db, application_id)
    return db_event


def get_timeline_events_by_application(db: Session, application_id: int, skip: int = 0, limit: int = 100):
    application = get_application(db, application_id)
    if application is None:
        return None
    
    events = db.query(models.TimelineEvent).filter(
        models.TimelineEvent.application_id == application_id
    ).order_by(
        models.TimelineEvent.event_date.desc(),
        models.TimelineEvent.event_time.desc()
    ).offset(skip).limit(limit).all()
    
    return events if events else []


def get_timeline_event(db: Session, event_id: int):
    return db.query(models.TimelineEvent).filter(
        models.TimelineEvent.id == event_id
    ).first()


def update_timeline_event(db: Session, event_id: int, event_update: schemas.TimelineEventUpdate):
    db_event = get_timeline_event(db, event_id)
    if db_event is None:
        return None
    
    application_id = db_event.application_id
    
    update_data = event_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    
    update_application_status(db, application_id)
    return db_event


def delete_timeline_event(db: Session, event_id: int):
    db_event = get_timeline_event(db, event_id)
    if db_event is None:
        return False
    
    application_id = db_event.application_id
    
    db.delete(db_event)
    db.commit()
    
    update_application_status(db, application_id)
    return True


def toggle_timeline_event_completed(db: Session, event_id: int):
    db_event = get_timeline_event(db, event_id)
    if db_event is None:
        return None
    
    application_id = db_event.application_id
    
    db_event.completed = not db_event.completed
    
    db.commit()
    db.refresh(db_event)
    
    update_application_status(db, application_id)
    return db_event


# ============================================
# DASHBOARD CRUD FUNCTIONS
# ============================================

def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    """Get dashboard statistics based on Application status."""
    applications = db.query(models.Application).all()
    
    total = len(applications)
    applied = sum(1 for app in applications if app.status == "Applied")
    interviewing = sum(1 for app in applications if app.status == "Interviewing")
    offer = sum(1 for app in applications if app.status == "Offer")
    rejected = sum(1 for app in applications if app.status == "Rejected")
    joined = sum(1 for app in applications if app.status == "Joined")
    
    return schemas.DashboardStats(
        total=total,
        applied=applied,
        interviewing=interviewing,
        offer=offer,
        rejected=rejected,
        joined=joined
    )


def get_recent_activity(db: Session, limit: int = 5) -> List[schemas.RecentActivityItem]:
    """Get recent activity across all applications."""
    events = db.query(
        models.TimelineEvent,
        models.Application.company,
        models.Application.role,
        models.Application.status
    ).join(
        models.Application,
        models.TimelineEvent.application_id == models.Application.id
    ).order_by(
        desc(models.TimelineEvent.event_date),
        desc(models.TimelineEvent.event_time)
    ).limit(limit).all()
    
    result = []
    for event, company, role, status in events:
        result.append(schemas.RecentActivityItem(
            id=event.id,
            company=company,
            role=role,
            status=status,
            event=event.title,
            event_date=event.event_date
        ))
    
    return result


def get_upcoming_events(db: Session, days_ahead: int = 14) -> List[schemas.UpcomingEventItem]:
    """Get upcoming events in the next N days."""
    today = date.today()
    future_date = today + timedelta(days=days_ahead)
    
    events = db.query(
        models.TimelineEvent,
        models.Application.company,
        models.Application.role
    ).join(
        models.Application,
        models.TimelineEvent.application_id == models.Application.id
    ).filter(
        models.TimelineEvent.event_date >= today,
        models.TimelineEvent.event_date <= future_date,
        models.TimelineEvent.completed == False
    ).order_by(
        models.TimelineEvent.event_date
    ).limit(10).all()
    
    result = []
    for event, company, role in events:
        result.append(schemas.UpcomingEventItem(
            id=event.id,
            application_id=event.application_id,
            title=event.title,
            event_date=event.event_date,
            company=company,
            role=role
        ))
    
    return result


def get_today_events(db: Session) -> List[schemas.TodayEventItem]:
    """Get events happening today."""
    today = date.today()
    
    events = db.query(
        models.TimelineEvent,
        models.Application.company,
        models.Application.role
    ).join(
        models.Application,
        models.TimelineEvent.application_id == models.Application.id
    ).filter(
        models.TimelineEvent.event_date == today
    ).order_by(
        models.TimelineEvent.event_time
    ).all()
    
    result = []
    for event, company, role in events:
        result.append(schemas.TodayEventItem(
            id=event.id,
            application_id=event.application_id,
            title=event.title,
            event_date=event.event_date,
            company=company,
            role=role
        ))
    
    return result


def get_recent_offers(db: Session, limit: int = 3) -> List[schemas.RecentOfferItem]:
    """Get recent offers."""
    applications = db.query(models.Application).filter(
        models.Application.status == "Offer"
    ).order_by(
        desc(models.Application.created_at)
    ).limit(limit).all()
    
    result = []
    for app in applications:
        result.append(schemas.RecentOfferItem(
            id=app.id,
            company=app.company,
            role=app.role,
            status=app.status,
            offer_date=app.created_at.date()
        ))
    
    return result


def get_recent_rejections(db: Session, limit: int = 3) -> List[schemas.RecentRejectionItem]:
    """Get recent rejections."""
    applications = db.query(models.Application).filter(
        models.Application.status == "Rejected"
    ).order_by(
        desc(models.Application.created_at)
    ).limit(limit).all()
    
    result = []
    for app in applications:
        result.append(schemas.RecentRejectionItem(
            id=app.id,
            company=app.company,
            role=app.role,
            status=app.status,
            rejection_date=app.created_at.date()
        ))
    
    return result


def get_dashboard_data(db: Session) -> schemas.DashboardResponse:
    """Get all dashboard data in a single response."""
    stats = get_dashboard_stats(db)
    recent_activity = get_recent_activity(db)
    upcoming_events = get_upcoming_events(db)
    today_events = get_today_events(db)
    recent_offers = get_recent_offers(db)
    recent_rejections = get_recent_rejections(db)
    
    return schemas.DashboardResponse(
        stats=stats,
        recent_activity=recent_activity,
        upcoming_events=upcoming_events,
        today_events=today_events,
        recent_offers=recent_offers,
        recent_rejections=recent_rejections
    )