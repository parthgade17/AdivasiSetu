"""Convert DB rows into the exact JSON shapes the React pages use."""
from ..timeutil import utcnow
from datetime import date, datetime
from ..data import DOC_TYPES, STAGES, STAGE_KEYS
from .eligibility import evaluate


def fmt_date(d) -> str:
    if not d:
        return ""
    if isinstance(d, str):
        d = datetime.fromisoformat(d)
    return d.strftime("%d %b %Y")


def rupees(n: int) -> str:
    s = str(int(n))
    if len(s) <= 3:
        return "₹" + s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    if head:
        parts.insert(0, head)
    return "₹" + ",".join(parts) + "," + tail


def scheme_out(s, profile=None, applied_ids=()):
    d = s.data or {}
    deadline = date.fromisoformat(s.deadline)
    out = {
        "id": s.id, "name": s.name, "ministry": d.get("ministry"), "amount": d.get("amount"),
        "period": d.get("period"), "deadline": fmt_date(deadline), "deadlineIso": s.deadline,
        "daysLeft": (deadline - date.today()).days, "type": d.get("type"), "category": d.get("category"),
        "description": d.get("description"), "criteria": d.get("criteria", []),
        "documents": [DOC_TYPES[k][0] for k in d.get("documents", []) if k in DOC_TYPES],
        "documentKeys": d.get("documents", []), "states": d.get("states"), "link": d.get("link"),
        "rules": s.rules, "active": s.active, "amountValue": s.amount_value, "applied": s.id in applied_ids,
        "eligible": None, "reasons": [], "failed": [],
    }
    if profile:
        r = evaluate(s.rules or {}, profile)
        out.update(eligible=r["eligible"], reasons=r["reasons"], failed=r["failed"])
    return out


def ui_status(stage: str) -> str:
    if stage == "rejected":
        return "rejected"
    if stage in ("approved", "disbursed"):
        return "approved"
    if stage == "state_verified":
        return "under_review"
    return "pending"


def application_out(a, scheme, student, docs=()):
    hist = {h["stage"]: h for h in (a.history or [])}
    timeline = []
    if a.stage == "rejected":
        for key, label, note in STAGES:
            if key in hist:
                timeline.append({"date": fmt_date(hist[key]["at"]), "status": label, "note": hist[key].get("note") or note, "done": True})
        rej = hist.get("rejected", {})
        timeline.append({"date": fmt_date(rej.get("at")), "status": "Rejected", "note": a.rejection_reason or "Rejected",
                         "done": True, "isRejection": True})
    else:
        current = STAGE_KEYS.index(a.stage) if a.stage in STAGE_KEYS else 0
        for i, (key, label, note) in enumerate(STAGES):
            if key in hist:
                timeline.append({"date": fmt_date(hist[key]["at"]), "status": label, "note": hist[key].get("note") or note,
                                 "done": True, "active": i == current and a.stage != "disbursed"})
            else:
                timeline.append({"date": "Pending", "status": label, "note": "Pending", "done": False})
    disb = hist.get("disbursed")
    d = scheme.data or {}
    return {
        "id": a.code, "dbId": a.id, "schemeId": scheme.id, "scheme": scheme.name, "ministry": d.get("ministry"),
        "category": d.get("category"), "submittedDate": fmt_date(a.created_at), "submittedIso": a.created_at.isoformat(),
        "amount": rupees(a.amount_value or scheme.amount_value), "status": ui_status(a.stage), "stage": a.stage,
        "paymentStatus": "disbursed" if a.stage == "disbursed" else ("pending" if a.stage != "rejected" else None),
        "paymentDate": fmt_date(disb["at"]) if disb else None, "paymentRef": a.payment_ref if disb else None,
        "rejectionReason": a.rejection_reason, "history": timeline,
        "documents": [DOC_TYPES[x.doc_type][0] for x in docs if x.doc_type in DOC_TYPES and x.status != "quality_issue"],
        "studentId": student.id, "name": student.name, "district": student.district or "—", "state": student.state,
        "assisted": bool(a.assisted_by),
    }


def document_list(docs):
    by_type = {d.doc_type: d for d in docs}
    out = []
    for key, (name, desc, mandatory) in DOC_TYPES.items():
        d = by_type.get(key)
        out.append({
            "id": key, "name": name, "desc": desc, "mandatory": mandatory,
            "status": d.status if d else "missing", "file": d.filename if d else None,
            "hasFile": bool(d and d.stored_path), "uploadDate": fmt_date(d.uploaded_at) if d else None, "quality": d.quality if d else None,
            "issues": d.issues if d else [], "source": d.source if d else None,
        })
    return out


ICONS = {
    "payment": ("💰", "#1B7A3E", "#E8F5ED"), "deadline": ("⏰", "#D4800A", "#FFF3DC"),
    "status": ("🔄", "#1565C0", "#E3F0FF"), "reminder": ("📄", "#C0392B", "#FDECEA"),
    "info": ("🎓", "#003366", "#F0F4FF"),
}


def time_ago(dt: datetime) -> str:
    secs = (utcnow() - dt).total_seconds()
    if secs < 60:
        return "Just now"
    if secs < 3600:
        return f"{int(secs // 60)} min ago"
    if secs < 86400:
        h = int(secs // 3600)
        return f"{h} hour{'s' if h > 1 else ''} ago"
    days = int(secs // 86400)
    return f"{days} day{'s' if days > 1 else ''} ago" if days < 7 else fmt_date(dt)


def notification_out(n):
    icon, color, bg = ICONS.get(n.type, ICONS["info"])
    return {"id": n.id, "type": n.type, "read": n.read, "title": n.title, "body": n.body,
            "time": time_ago(n.created_at), "icon": icon, "color": color, "bg": bg}


def student_out(s, app_count=0):
    p = s.profile or {}
    complete = all(p.get(k) for k in ("name", "course", "income", "state", "district"))
    return {
        "id": s.id, "name": s.name, "phone": s.phone or "—",
        "village": ", ".join(x for x in [p.get("village"), s.district] if x) or "—",
        "tribe": p.get("tribe") or "—", "class": p.get("course") or "—",
        "income": f"₹{int(p['income']) / 100000:g}L/yr" if str(p.get("income") or "").isdigit() else "—",
        "status": "complete" if app_count and complete else ("incomplete" if complete or app_count else "not_started"),
        "applications": app_count, "notes": s.notes or "", "profile": p,
    }
