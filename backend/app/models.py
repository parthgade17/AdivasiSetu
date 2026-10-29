from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text, UniqueConstraint
from .database import Base
from .timeutil import utcnow


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("phone", "role"),)
    id = Column(Integer, primary_key=True)
    phone = Column(String(15), nullable=False)
    role = Column(String(20), nullable=False)  # student | assistant | admin
    name = Column(String(120), default="")
    csc_id = Column(String(40), nullable=True)
    active = Column(Boolean, default=True, nullable=True)  # NULL counts as active
    created_at = Column(DateTime, default=utcnow)


class Session(Base):
    __tablename__ = "sessions"
    token = Column(String(64), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=True)


class OtpCode(Base):
    """One-time passwords are stored hashed and expire quickly."""
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True)
    phone = Column(String(15), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    code_hash = Column(String(64), nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)


class Student(Base):
    """A student profile. Owned by a student user, or created by an assistant (assisted mode)."""
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(120), default="")
    phone = Column(String(15), default="")
    state = Column(String(60), default="")
    district = Column(String(60), default="")
    profile = Column(JSON, default=dict)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)


class Scheme(Base):
    __tablename__ = "schemes"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    data = Column(JSON, default=dict)      # display fields (ministry, amount, criteria...)
    rules = Column(JSON, default=dict)     # eligibility rules
    deadline = Column(String(10))          # ISO date
    amount_value = Column(Integer, default=0)
    active = Column(Boolean, default=True)


class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True)
    code = Column(String(20), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    stage = Column(String(30), default="submitted")
    history = Column(JSON, default=list)
    rejection_reason = Column(Text, nullable=True)
    payment_ref = Column(String(40), nullable=True)
    amount_value = Column(Integer, default=0)
    client_ref = Column(String(64), unique=True, nullable=True)  # offline sync de-duplication
    assisted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (UniqueConstraint("student_id", "doc_type"),)
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    doc_type = Column(String(40), nullable=False)
    filename = Column(String(200))
    stored_path = Column(String(300), nullable=True)
    status = Column(String(20), default="pending_review")  # verified | pending_review | quality_issue
    quality = Column(Integer, nullable=True)
    issues = Column(JSON, default=list)
    source = Column(String(20), default="upload")  # upload | digilocker
    uploaded_at = Column(DateTime, default=utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    type = Column(String(20), default="info")  # payment | deadline | status | reminder | info
    title = Column(String(200))
    body = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
