from typing import Optional
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session as DBSession
from .database import get_db
from .timeutil import utcnow
from . import models


def current_user(authorization: Optional[str] = Header(None), db: DBSession = Depends(get_db)) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please sign in")
    sess = db.get(models.Session, authorization[7:])
    if not sess or (sess.expires_at and sess.expires_at < utcnow()):
        if sess:
            db.delete(sess)
            db.commit()
        raise HTTPException(401, "Session expired. Please sign in again.")
    user = db.get(models.User, sess.user_id)
    if not user or user.active is False:
        raise HTTPException(401, "This account is disabled")
    return user


def current_token(authorization: Optional[str] = Header(None)) -> str:
    return (authorization or "")[7:]


def optional_user(authorization: Optional[str] = Header(None), db: DBSession = Depends(get_db)):
    try:
        return current_user(authorization, db)
    except HTTPException:
        return None


def require_role(*roles):
    def dep(user: models.User = Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(403, "You do not have access to this page")
        return user
    return dep


def resolve_student(db: DBSession, user: models.User, student_id: Optional[int]) -> models.Student:
    """Students act on their own profile. Assistants act on students they registered. Admins on anyone."""
    if user.role == "student":
        s = db.query(models.Student).filter_by(user_id=user.id).first()
        if not s:
            s = models.Student(user_id=user.id, phone=user.phone, name=user.name, profile={"phone": user.phone, "category": "ST"})
            db.add(s)
            db.commit()
            db.refresh(s)
        return s
    if not student_id:
        raise HTTPException(400, "Select a student first")
    s = db.get(models.Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    if user.role == "assistant" and s.created_by != user.id:
        raise HTTPException(403, "This student is not registered under your CSC ID")
    return s
