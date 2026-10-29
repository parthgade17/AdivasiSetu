"""Application lifecycle: create, advance through stages, reject — with notifications."""
import random
from ..timeutil import utcnow
from datetime import datetime
from sqlalchemy.orm import Session as DBSession
from .. import models
from ..data import STAGES, STAGE_KEYS, DOC_TYPES
from .serializers import rupees


def notify(db: DBSession, student_id: int, type_: str, title: str, body: str):
    db.add(models.Notification(student_id=student_id, type=type_, title=title, body=body))


def next_code(db: DBSession) -> str:
    n = db.query(models.Application).count() + 1
    code = f"APP2026{n:03d}"
    while db.query(models.Application).filter_by(code=code).first():
        n += 1
        code = f"APP2026{n:03d}"
    return code


def create_application(db, student, scheme, assisted_by=None, client_ref=None, at=None):
    at = at or utcnow()
    app = models.Application(
        code=next_code(db), student_id=student.id, scheme_id=scheme.id, stage="submitted",
        history=[{"stage": "submitted", "at": at.isoformat(), "note": "Application submitted" + (" by CSC operator" if assisted_by else " successfully")}],
        amount_value=scheme.amount_value, client_ref=client_ref, assisted_by=assisted_by, created_at=at,
    )
    db.add(app)
    docs = {d.doc_type: d for d in db.query(models.Document).filter_by(student_id=student.id)}
    missing = [DOC_TYPES[k][0] for k in (scheme.data or {}).get("documents", []) if k not in docs or docs[k].status == "quality_issue"]
    body = f"Your application for {scheme.name} has been submitted."
    if missing:
        body += f" Upload these documents so it can be verified: {', '.join(missing)}."
        notify(db, student.id, "reminder", "Documents needed for verification", body)
    else:
        notify(db, student.id, "status", "Application submitted", body)
    return app


def advance(db, app, scheme, at=None):
    if app.stage in ("rejected", "disbursed"):
        return app
    idx = STAGE_KEYS.index(app.stage) + 1
    key, label, note = STAGES[idx]
    at = at or utcnow()
    app.history = (app.history or []) + [{"stage": key, "at": at.isoformat(), "note": note}]
    app.stage = key
    if key == "disbursed":
        app.payment_ref = f"PFMS{at:%Y%m%d}{random.randint(10, 99)}"
        notify(db, app.student_id, "payment", f"Payment received — {rupees(app.amount_value)}",
               f"{scheme.name} has been credited to your bank account via DBT. Ref: {app.payment_ref}.")
    else:
        notify(db, app.student_id, "status", f"{label}: {app.code}", f"Your {scheme.name} application moved to '{label}'.")
    return app


def reject(db, app, scheme, reason, at=None):
    at = at or utcnow()
    app.history = (app.history or []) + [{"stage": "rejected", "at": at.isoformat(), "note": reason}]
    app.stage = "rejected"
    app.rejection_reason = reason
    notify(db, app.student_id, "status", f"Application rejected: {app.code}",
           f"{scheme.name} was rejected. Reason: {reason}. You can fix this and reapply.")
    return app
