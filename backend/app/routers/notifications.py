from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..deps import current_user, resolve_student
from ..services.serializers import notification_out
from .. import models

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    rows = db.query(models.Notification).filter_by(student_id=s.id).order_by(models.Notification.created_at.desc())
    return [notification_out(n) for n in rows]


@router.post("/read-all")
def read_all(student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    db.query(models.Notification).filter_by(student_id=s.id).update({"read": True})
    db.commit()
    return {"ok": True}


@router.post("/{nid}/read")
def read_one(nid: int, student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    db.query(models.Notification).filter_by(id=nid, student_id=s.id).update({"read": True})
    db.commit()
    return {"ok": True}
