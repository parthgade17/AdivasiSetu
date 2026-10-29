from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from .. import config
from ..database import get_db
from ..deps import current_user, resolve_student
from ..services.eligibility import evaluate
from ..services.serializers import application_out
from ..services.workflow import create_application, advance
from .. import models

router = APIRouter(prefix="/applications", tags=["applications"])


def serialize(db, a):
    scheme = db.get(models.Scheme, a.scheme_id)
    student = db.get(models.Student, a.student_id)
    docs = db.query(models.Document).filter_by(student_id=student.id).all()
    return application_out(a, scheme, student, docs)


@router.get("")
def list_apps(student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    apps = db.query(models.Application).filter_by(student_id=s.id).order_by(models.Application.created_at.desc())
    return [serialize(db, a) for a in apps]


class ApplyBody(BaseModel):
    scheme_id: int
    client_ref: Optional[str] = None


@router.post("")
def apply(body: ApplyBody, student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    if body.client_ref:
        existing = db.query(models.Application).filter_by(client_ref=body.client_ref).first()
        if existing:  # offline re-sync of the same submission
            return serialize(db, existing)
    scheme = db.get(models.Scheme, body.scheme_id)
    if not scheme or not scheme.active:
        raise HTTPException(404, "Scheme not found")
    if date.fromisoformat(scheme.deadline) < date.today():
        raise HTTPException(400, f"The deadline for this scheme has passed ({scheme.deadline})")
    profile = s.profile or {}
    if not profile.get("course"):
        raise HTTPException(400, "Complete the eligibility check or profile first")
    verdict = evaluate(scheme.rules or {}, profile)
    if not verdict["eligible"]:
        raise HTTPException(400, "Not eligible: " + "; ".join(verdict["failed"]))
    dup = db.query(models.Application).filter(
        models.Application.student_id == s.id, models.Application.scheme_id == scheme.id,
        models.Application.stage != "rejected").first()
    if dup:
        raise HTTPException(409, f"Already applied for this scheme ({dup.code})")
    a = create_application(db, s, scheme, assisted_by=user.id if user.role == "assistant" else None, client_ref=body.client_ref)
    db.commit()
    db.refresh(a)
    return serialize(db, a)


@router.post("/{code}/refresh")
def refresh(code: str, user=Depends(current_user), db: DBSession = Depends(get_db)):
    """Demo helper: simulates the next government verification step. Disabled outside demo mode."""
    if not config.DEMO_MODE:
        raise HTTPException(404, "Not found")
    a = db.query(models.Application).filter_by(code=code).first()
    if not a:
        raise HTTPException(404, "Application not found")
    resolve_student(db, user, a.student_id)
    advance(db, a, db.get(models.Scheme, a.scheme_id))
    db.commit()
    return serialize(db, a)
