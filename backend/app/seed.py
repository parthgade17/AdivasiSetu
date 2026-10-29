"""Demo data so the prototype has realistic content on first run."""
from datetime import datetime
from . import models
from .data import SCHEMES
from .services.workflow import create_application, advance, reject, notify

DEMO_USERS = {
    "student": ("9876543210", "Ramesh Bhavale"),
    "assistant": ("9123456780", "Teacher Ramesh Wankhede"),
    "admin": ("9000000001", "Admin Officer"),
}


def _student(db, name, district, course, income, tribe, state="Maharashtra", village="", phone="", created_by=None, user_id=None, extra=None):
    p = {"name": name, "phone": phone, "state": state, "district": district, "village": village, "tribe": tribe,
         "category": "ST", "course": course, "income": str(income), **(extra or {})}
    s = models.Student(name=name, phone=phone, state=state, district=district, profile=p, created_by=created_by, user_id=user_id)
    db.add(s)
    db.flush()
    return s


def _doc(db, sid, key, status, quality, filename, source="upload", issues=None, at=datetime(2026, 9, 5)):
    db.add(models.Document(student_id=sid, doc_type=key, status=status, quality=quality, filename=filename,
                           source=source, issues=issues or [], uploaded_at=at))


def _app(db, student, scheme, created, steps=(), reject_reason=None, assisted_by=None):
    a = create_application(db, student, scheme, assisted_by=assisted_by, at=created)
    db.flush()
    for at in steps:
        advance(db, a, scheme, at=at)
    if reject_reason:
        reject(db, a, scheme, reject_reason, at=steps[-1] if steps else created)
    return a


def seed_schemes(db):
    """Scheme catalogue. Safe for production: only runs when the table is empty."""
    if db.query(models.Scheme).count():
        return
    for s in SCHEMES:
        db.add(models.Scheme(**s))
    db.commit()


def seed_demo(db):
    """Demo accounts, students and applications. Only runs on an empty users table."""
    if db.query(models.User).count():
        return
    seed_schemes(db)
    schemes = db.query(models.Scheme).order_by(models.Scheme.id).all()
    pre, post, nfs, nos, maha, mp = schemes

    users = {}
    for role, (phone, name) in DEMO_USERS.items():
        u = models.User(phone=phone, role=role, name=name, csc_id="MH-GC-0042" if role == "assistant" else None)
        db.add(u)
        users[role] = u
    db.flush()

    # Main demo student
    ramesh = _student(db, "Ramesh Bhavale", "Gadchiroli", "Bachelor's Degree (UG)", 120000, "Gond", village="Dhanora",
                      phone="9876543210", user_id=users["student"].id, extra={
                          "dob": "2004-05-14", "gender": "Male", "aadhaar": "****-****-3421", "email": "ramesh.bhavale@gmail.com",
                          "bpl": "No", "employed": "No", "institution": "Gondwana University, Gadchiroli", "year": "3rd Year",
                          "branch": "B.Sc Agriculture", "rollNo": "GU2024AGR0042", "lastPercentage": "74.5", "boardYear": "2021",
                          "fatherOccupation": "Farmer", "motherOccupation": "Daily Wage Worker", "bankName": "Bank of Maharashtra",
                          "accountNo": "****9821", "ifsc": "MAHB0001234", "branch_bank": "Gadchiroli Main Branch",
                          "accountHolder": "Ramesh Bhavale"})
    _doc(db, ramesh.id, "st_certificate", "verified", 100, "ST_Certificate.pdf")
    _doc(db, ramesh.id, "income_certificate", "pending_review", 88, "Income_Cert.jpg", at=datetime(2026, 9, 8))
    _doc(db, ramesh.id, "marksheet", "verified", 100, "Marksheet_2025.pdf")
    _doc(db, ramesh.id, "aadhaar", "verified", 95, "Aadhaar_Ramesh.jpg")
    _doc(db, ramesh.id, "bank_passbook", "quality_issue", 42, "Bank_Pass_blurry.jpg",
         issues=["Blurry — hold the phone steady and tap to focus"], at=datetime(2026, 9, 10))
    _doc(db, ramesh.id, "photo", "verified", 100, "Photo_Ramesh.jpg")
    _app(db, ramesh, post, datetime(2026, 9, 10, 10), steps=[datetime(2026, 9, 14), datetime(2026, 9, 18),
                                                             datetime(2026, 9, 22), datetime(2026, 9, 25)])
    _app(db, ramesh, maha, datetime(2026, 8, 5, 11), steps=[datetime(2026, 8, 10)], reject_reason="Expired Income Certificate")
    notify(db, ramesh.id, "deadline", "Deadline alert: MahaDBT Scholarship",
           "MahaDBT closes on 31 Oct 2026. Your earlier application was rejected — reapply with a fresh income certificate.")

    # Students registered by the CSC operator (assisted mode)
    op = users["assistant"].id
    priya = _student(db, "Priya Bhavale", "Gadchiroli", "Bachelor's Degree (UG)", 120000, "Gond", village="Dhanora", phone="9876500010", created_by=op)
    raju = _student(db, "Raju Meshram", "Gadchiroli", "Class 9–10", 80000, "Gond", village="Aheri", phone="9765432109", created_by=op)
    _student(db, "Kavita Atram", "Chandrapur", "Class 11–12", 150000, "Kolam", village="Korpana", created_by=op)
    _app(db, priya, post, datetime(2026, 9, 20, 9), steps=[datetime(2026, 9, 24), datetime(2026, 9, 28)], assisted_by=op)
    _app(db, priya, maha, datetime(2026, 9, 29, 15), assisted_by=op)
    _app(db, raju, pre, datetime(2026, 9, 22, 12), steps=[datetime(2026, 9, 25)], assisted_by=op)

    # Other students across districts for the admin queue
    for name, dist, course, inc, tribe, sch, created, steps, rej in [
        ("Sunita Valvi", "Nandurbar", "Class 11–12", 90000, "Bhil", post, datetime(2026, 9, 26, 10), 1, None),
        ("Mahesh Gavit", "Nandurbar", "Diploma / ITI", 140000, "Bhil", post, datetime(2026, 9, 27, 14), 0, None),
        ("Kavita Padvi", "Nashik", "Bachelor's Degree (UG)", 200000, "Kokna", maha, datetime(2026, 9, 28, 16), 2, None),
        ("Dinesh Tadvi", "Dhule", "Class 9–10", 70000, "Bhil", pre, datetime(2026, 9, 30, 11), 0, None),
        ("Lata Kumre", "Melghat", "Class 11–12", 260000, "Korku", post, datetime(2026, 9, 24, 9), 1, "Income Limit Exceeded"),
        ("Vijay Atram", "Gadchiroli", "Ph.D / Research", 300000, "Gond", nfs, datetime(2026, 9, 21, 13), 3, None),
    ]:
        st = _student(db, name, dist, course, inc, tribe)
        _app(db, st, sch, created, steps=[created.replace(day=min(created.day + i + 1, 30)) for i in range(steps)], reject_reason=rej)

    # Older seeded notifications start as read; keep only the important ones unread.
    db.flush()
    db.query(models.Notification).update({"read": True})
    db.query(models.Notification).filter(models.Notification.student_id == ramesh.id,
                                         models.Notification.type.in_(["deadline", "payment"])).update({"read": False}, synchronize_session=False)
    db.commit()
