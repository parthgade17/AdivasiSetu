import copy
from collections import Counter
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..services.serializers import scheme_out
from ..timeutil import utcnow
from ..deps import require_role
from ..data import BASELINE, REJECTION_REASONS
from ..services.workflow import advance, reject
from .applications import serialize
from .. import models

router = APIRouter(prefix="/admin", tags=["admin"])
admin_only = require_role("admin")


def fmt_in(n: int) -> str:
    s = str(int(n))
    if len(s) <= 3:
        return s
    head, tail, parts = s[:-3], s[-3:], []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts) + "," + tail


@router.get("/summary")
def summary(user=Depends(admin_only), db: DBSession = Depends(get_db)):
    """Baseline historic figures + live data from applications submitted through this app."""
    b = copy.deepcopy(BASELINE)
    apps = db.query(models.Application).all()
    schemes = {s.id: s for s in db.query(models.Scheme)}
    students = {s.id: s for s in db.query(models.Student)}

    live = Counter()
    month_idx = {m["month"]: m for m in b["monthly"]}
    dist_idx = {d["name"]: d for d in b["districts"]}
    for a in apps:
        approved = a.stage in ("approved", "disbursed")
        rejected = a.stage == "rejected"
        live["apps"] += 1
        live["approved"] += approved
        live["rejected"] += rejected
        if a.stage == "disbursed":
            live["disbursed_amt"] += a.amount_value or 0
        m = month_idx.get(a.created_at.strftime("%b"))
        if m:
            m["apps"] += 1
            m["approved"] += approved
            m["rejected"] += rejected
            m["disbursed"] += a.stage == "disbursed"
        st = students.get(a.student_id)
        if st and st.district:
            d = dist_idx.get(st.district)
            if d:  # districts without baseline enrolment data are counted in totals only
                d["applied"] += 1
                d["approved"] += approved
                d["rejected"] += rejected
        sc = schemes.get(a.scheme_id)
        cat = (sc.data or {}).get("category") if sc else None
        if cat in b["scheme_wise"]:
            b["scheme_wise"][cat]["applications"] += 1
            b["scheme_wise"][cat]["approved"] += approved
        if rejected:
            reason = a.rejection_reason if a.rejection_reason in REJECTION_REASONS else "Others"
            b["rejections"][reason] = b["rejections"].get(reason, 0) + 1

    total_apps = b["kpis"]["applications"] + live["apps"]
    total_approved = b["kpis"]["approved"] + live["approved"]
    disbursed_cr = b["kpis"]["disbursed_cr"] + live["disbursed_amt"] / 1e7
    districts = []
    for d in b["districts"]:
        rate = round(100 * d["applied"] / d["eligible"]) if d["eligible"] else 0
        rej = round(100 * d["rejected"] / d["applied"]) if d["applied"] else 0
        districts.append({**d, "rate": rate, "rejRate": rej})
    districts.sort(key=lambda d: d["rate"])
    rej_total = sum(b["rejections"].values()) or 1
    rejections = [{"reason": r, "count": c, "pct": round(100 * c / rej_total)} for r, c in
                  sorted(b["rejections"].items(), key=lambda x: -x[1])]
    scheme_wise = [{"name": k, **v, "amount": f"₹{v['amount_cr']} Cr"} for k, v in b["scheme_wise"].items()]
    open_count = sum(1 for a in apps if a.stage not in ("approved", "disbursed", "rejected"))
    pie_total = sum(s["applications"] for s in scheme_wise) or 1
    colors = ["#003366", "#FF6B1A", "#1B7A3E", "#9AA3BC", "#D4800A"]
    return {
        "kpis": {
            "eligible": fmt_in(b["kpis"]["eligible"]), "applications": fmt_in(total_apps),
            "approvalRate": f"{100 * total_approved / total_apps:.1f}%", "disbursed": f"₹{disbursed_cr:.1f} Cr",
            "registered": fmt_in(b["kpis"]["registered"] + len(students)),
            "thisMonth": fmt_in((month_idx.get(utcnow().strftime("%b")) or {"apps": 0})["apps"]), "liveApplications": live["apps"], "openReview": open_count,
        },
        "monthlyTrend": b["monthly"],
        "districtData": districts,
        "lowCoverage": [d for d in districts if d["rate"] < 45],
        "schemeWise": scheme_wise,
        "schemeDistribution": [{"name": s["name"], "value": round(100 * s["applications"] / pie_total), "color": colors[i % 5]}
                               for i, s in enumerate(scheme_wise)],
        "rejectionReasons": rejections,
        "recentApps": [serialize(db, a) for a in sorted(apps, key=lambda a: a.created_at, reverse=True)[:8]],
    }


@router.get("/applications")
def applications(status: str = "open", user=Depends(admin_only), db: DBSession = Depends(get_db)):
    q = db.query(models.Application).order_by(models.Application.created_at.desc())
    if status == "open":
        q = q.filter(models.Application.stage.notin_(["approved", "disbursed", "rejected"]))
    return [serialize(db, a) for a in q]


@router.post("/applications/{code}/advance")
def approve_step(code: str, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    a = db.query(models.Application).filter_by(code=code).first()
    if not a:
        raise HTTPException(404, "Application not found")
    if a.stage in ("rejected", "disbursed"):
        raise HTTPException(400, f"This application is already {a.stage}")
    advance(db, a, db.get(models.Scheme, a.scheme_id))
    db.commit()
    return serialize(db, a)


class RejectBody(BaseModel):
    reason: str


@router.post("/applications/{code}/reject")
def reject_app(code: str, body: RejectBody, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    a = db.query(models.Application).filter_by(code=code).first()
    if not a:
        raise HTTPException(404, "Application not found")
    if a.stage in ("rejected", "disbursed"):
        raise HTTPException(400, f"This application is already {a.stage}")
    reject(db, a, db.get(models.Scheme, a.scheme_id), (body.reason or "").strip() or "Others")
    db.commit()
    return serialize(db, a)


@router.post("/schemes/{scheme_id}/toggle")
def toggle_scheme(scheme_id: int, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    s = db.get(models.Scheme, scheme_id)
    if not s:
        raise HTTPException(404, "Scheme not found")
    s.active = not s.active
    db.commit()
    return {"id": s.id, "active": s.active}


class SchemeBody(BaseModel):
    name: str
    deadline: str                      # YYYY-MM-DD
    amount_value: int = 0
    ministry: str = ""
    amount: str = ""
    period: str = "per year"
    type: str = "central"              # central | state
    category: str = ""
    states: str = "All States / UTs"
    link: str = ""
    description: str = ""
    criteria: list[str] = []
    documents: list[str] = []
    courses: list[str] = []
    max_income: Optional[int] = None
    allowed_states: list[str] = []     # empty = all states
    active: bool = True


def _apply_scheme(row: models.Scheme, b: SchemeBody):
    from ..data import DOC_TYPES, COURSES
    if not b.name.strip():
        raise HTTPException(400, "Enter the scheme name")
    try:
        date.fromisoformat(b.deadline)
    except ValueError:
        raise HTTPException(400, "Deadline must be a date like 2026-12-31")
    if b.amount_value < 0:
        raise HTTPException(400, "Amount cannot be negative")
    bad = [d for d in b.documents if d not in DOC_TYPES]
    if bad:
        raise HTTPException(400, f"Unknown document types: {', '.join(bad)}")
    bad = [c for c in b.courses if c not in COURSES]
    if bad:
        raise HTTPException(400, f"Unknown courses: {', '.join(bad)}")
    row.name = b.name.strip()
    row.deadline = b.deadline
    row.amount_value = b.amount_value
    row.active = b.active
    row.data = dict(ministry=b.ministry, amount=b.amount or f"₹{b.amount_value:,}", period=b.period, type=b.type,
                    category=b.category, states=b.states, link=b.link, description=b.description,
                    criteria=b.criteria, documents=b.documents)
    rules = {"states": b.allowed_states or "all"}
    if b.courses:
        rules["courses"] = b.courses
    if b.max_income:
        rules["max_income"] = b.max_income
    row.rules = rules


@router.post("/schemes")
def create_scheme(body: SchemeBody, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    row = models.Scheme()
    _apply_scheme(row, body)
    db.add(row)
    db.commit()
    db.refresh(row)
    return scheme_out(row)


@router.put("/schemes/{scheme_id}")
def update_scheme(scheme_id: int, body: SchemeBody, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    row = db.get(models.Scheme, scheme_id)
    if not row:
        raise HTTPException(404, "Scheme not found")
    _apply_scheme(row, body)
    db.commit()
    return scheme_out(row)


class OperatorBody(BaseModel):
    phone: str
    name: str = ""
    csc_id: str = ""


def _operator_out(u):
    return {"id": u.id, "name": u.name, "phone": u.phone, "cscId": u.csc_id, "active": u.active is not False}


@router.get("/operators")
def list_operators(user=Depends(admin_only), db: DBSession = Depends(get_db)):
    return [_operator_out(u) for u in db.query(models.User).filter_by(role="assistant").order_by(models.User.id.desc())]


@router.post("/operators")
def add_operator(body: OperatorBody, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    if len(body.phone) != 10 or not body.phone.isdigit():
        raise HTTPException(400, "Enter a valid 10-digit mobile number")
    if db.query(models.User).filter_by(phone=body.phone, role="assistant").first():
        raise HTTPException(409, "This number is already registered as an operator")
    u = models.User(phone=body.phone, role="assistant", name=body.name.strip() or "CSC Operator",
                    csc_id=body.csc_id.strip() or f"MH-CSC-{body.phone[-4:]}")
    db.add(u)
    db.commit()
    db.refresh(u)
    return _operator_out(u)


@router.post("/operators/{user_id}/toggle")
def toggle_operator(user_id: int, user=Depends(admin_only), db: DBSession = Depends(get_db)):
    u = db.get(models.User, user_id)
    if not u or u.role != "assistant":
        raise HTTPException(404, "Operator not found")
    u.active = not (u.active is not False)
    if not u.active:
        db.query(models.Session).filter_by(user_id=u.id).delete()
    db.commit()
    return _operator_out(u)
