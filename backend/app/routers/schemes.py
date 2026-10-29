from typing import Optional
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..deps import optional_user, current_user, resolve_student
from ..services.serializers import scheme_out
from .students import apply_profile
from .. import models

router = APIRouter(tags=["schemes"])


def _applied_ids(db, student):
    return {a.scheme_id for a in db.query(models.Application).filter_by(student_id=student.id) if a.stage != "rejected"}


@router.get("/schemes")
def list_schemes(student_id: Optional[int] = None, include_inactive: bool = False,
                 user=Depends(optional_user), db: DBSession = Depends(get_db)):
    q = db.query(models.Scheme)
    if not (include_inactive and user and user.role == "admin"):
        q = q.filter_by(active=True)
    schemes = q.order_by(models.Scheme.deadline).all()
    profile, applied = None, set()
    if user and (user.role == "student" or student_id):
        try:
            s = resolve_student(db, user, student_id)
            profile = s.profile if (s.profile or {}).get("course") else None
            applied = _applied_ids(db, s)
        except Exception:
            pass
    return [scheme_out(x, profile, applied) for x in schemes]


class EligibilityBody(BaseModel):
    profile: dict
    save: bool = True


@router.post("/eligibility/check")
def check(body: EligibilityBody, student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    if body.save:
        apply_profile(s, body.profile)
        db.commit()
    profile = {**(s.profile or {}), **body.profile}
    applied = _applied_ids(db, s)
    results = [scheme_out(x, profile, applied) for x in db.query(models.Scheme).filter_by(active=True).order_by(models.Scheme.deadline)]
    return {"studentId": s.id, "eligible": [r for r in results if r["eligible"]], "all": results}
