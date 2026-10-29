from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..deps import current_user, require_role, resolve_student
from ..services.serializers import student_out
from .. import models

router = APIRouter(tags=["students"])


class ProfileBody(BaseModel):
    profile: dict


def apply_profile(s: models.Student, profile: dict):
    merged = {**(s.profile or {}), **{k: v for k, v in profile.items() if v is not None}}
    merged.setdefault("category", "ST")
    s.profile = merged
    s.name = merged.get("name") or s.name
    s.phone = merged.get("phone") or s.phone
    s.state = merged.get("state") or s.state
    s.district = merged.get("district") or s.district


@router.get("/profile")
def get_profile(student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    return {"studentId": s.id, "profile": s.profile or {}}


@router.put("/profile")
def save_profile(body: ProfileBody, student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    apply_profile(s, body.profile)
    if user.role == "student" and s.name:
        user.name = s.name
    db.commit()
    return {"studentId": s.id, "profile": s.profile}


class NewStudent(BaseModel):
    name: str
    phone: Optional[str] = ""
    profile: dict = {}


@router.get("/assisted/students")
def list_students(user=Depends(require_role("assistant", "admin")), db: DBSession = Depends(get_db)):
    q = db.query(models.Student)
    if user.role == "assistant":
        q = q.filter_by(created_by=user.id)
    out = []
    for s in q.order_by(models.Student.id.desc()):
        count = db.query(models.Application).filter_by(student_id=s.id).count()
        out.append(student_out(s, count))
    return out


@router.post("/assisted/students")
def create_student(body: NewStudent, user=Depends(require_role("assistant")), db: DBSession = Depends(get_db)):
    if not body.name.strip():
        raise HTTPException(400, "Enter the student's name")
    s = models.Student(created_by=user.id, name=body.name.strip(), phone=body.phone or "",
                       profile={"name": body.name.strip(), "phone": body.phone or "", "category": "ST", **body.profile})
    apply_profile(s, s.profile)
    db.add(s)
    db.commit()
    db.refresh(s)
    return student_out(s, 0)


class NotesBody(BaseModel):
    notes: str


@router.put("/assisted/students/{student_id}/notes")
def save_notes(student_id: int, body: NotesBody, user=Depends(require_role("assistant")), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    s.notes = body.notes
    db.commit()
    return {"ok": True}
