import hashlib
import hmac
import secrets
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from .. import config, models
from ..database import get_db
from ..deps import current_user, current_token
from ..services import sms
from ..timeutil import utcnow

router = APIRouter(prefix="/auth", tags=["auth"])
DEMO_OTP = "123456"
ROLES = ("student", "assistant", "admin")


class OtpRequest(BaseModel):
    phone: str
    role: str = "student"


class VerifyRequest(OtpRequest):
    otp: str


def _hash(phone: str, role: str, otp: str) -> str:
    return hmac.new(config.SECRET_KEY.encode(), f"{phone}:{role}:{otp}".encode(), hashlib.sha256).hexdigest()


def _is_demo_phone(db, phone, role) -> bool:
    return config.DEMO_MODE and db.query(models.User).filter_by(phone=phone, role=role).first() is not None \
        and phone in {"9876543210", "9123456780", "9000000001"}


def _role_allowed(db, phone, role) -> bool:
    """Students can self-register. Admins and CSC operators must be pre-approved (outside demo mode)."""
    if role == "student" or config.DEMO_MODE:
        return True
    existing = db.query(models.User).filter_by(phone=phone, role=role).first()
    if existing:
        return existing.active is not False
    allow = config.ADMIN_PHONES if role == "admin" else config.ASSISTANT_PHONES
    return phone in allow


def user_out(u, db):
    has_profile = False
    if u.role == "student":
        s = db.query(models.Student).filter_by(user_id=u.id).first()
        has_profile = bool(s and (s.profile or {}).get("course"))
    return {"id": u.id, "name": u.name, "phone": u.phone, "role": u.role, "cscId": u.csc_id, "hasProfile": has_profile}


def _check_input(body: OtpRequest):
    if len(body.phone) != 10 or not body.phone.isdigit() or body.phone[0] not in "6789":
        raise HTTPException(400, "Enter a valid 10-digit mobile number")
    if body.role not in ROLES:
        raise HTTPException(400, "Unknown role")


@router.post("/send-otp")
def send_otp(body: OtpRequest, db: DBSession = Depends(get_db)):
    _check_input(body)
    if not _role_allowed(db, body.phone, body.role):
        raise HTTPException(403, "This number is not registered for this role. Contact your administrator.")
    now = utcnow()
    recent = db.query(models.OtpCode).filter(models.OtpCode.phone == body.phone,
                                             models.OtpCode.created_at > now - timedelta(hours=1)).order_by(models.OtpCode.created_at.desc()).all()
    if recent and (now - recent[0].created_at).total_seconds() < config.OTP_RESEND_SECONDS:
        wait = int(config.OTP_RESEND_SECONDS - (now - recent[0].created_at).total_seconds()) + 1
        raise HTTPException(429, f"Please wait {wait} seconds before asking for another OTP")
    if len(recent) >= config.OTP_MAX_PER_HOUR:
        raise HTTPException(429, "Too many OTP requests. Try again in an hour.")

    otp = DEMO_OTP if _is_demo_phone(db, body.phone, body.role) else f"{secrets.randbelow(900000) + 100000}"
    db.query(models.OtpCode).filter_by(phone=body.phone, role=body.role, used=False).update({"used": True})
    db.add(models.OtpCode(phone=body.phone, role=body.role, code_hash=_hash(body.phone, body.role, otp),
                          expires_at=now + timedelta(seconds=config.OTP_TTL_SECONDS)))
    db.commit()
    try:
        sms.send_otp(body.phone, otp)
    except sms.SmsError:
        raise HTTPException(502, "Could not send the SMS right now. Please try again.")
    out = {"sent": True, "expiresIn": config.OTP_TTL_SECONDS, "resendIn": config.OTP_RESEND_SECONDS}
    if config.DEMO_MODE:
        out["demoOtp"] = otp
    return out


@router.post("/verify-otp")
def verify_otp(body: VerifyRequest, db: DBSession = Depends(get_db)):
    _check_input(body)
    row = db.query(models.OtpCode).filter_by(phone=body.phone, role=body.role, used=False) \
        .order_by(models.OtpCode.created_at.desc()).first()
    if not row or row.expires_at < utcnow():
        raise HTTPException(400, "OTP expired or not requested. Ask for a new OTP.")
    if row.attempts >= config.OTP_MAX_ATTEMPTS:
        row.used = True
        db.commit()
        raise HTTPException(429, "Too many wrong attempts. Ask for a new OTP.")
    if not hmac.compare_digest(row.code_hash, _hash(body.phone, body.role, body.otp.strip())):
        row.attempts += 1
        db.commit()
        raise HTTPException(400, "Incorrect OTP")
    row.used = True

    if not _role_allowed(db, body.phone, body.role):
        raise HTTPException(403, "This number is not registered for this role")
    user = db.query(models.User).filter_by(phone=body.phone, role=body.role).first()
    if not user:
        default_name = {"student": "Student", "assistant": "CSC Operator", "admin": "Admin Officer"}[body.role]
        user = models.User(phone=body.phone, role=body.role, name=default_name,
                           csc_id=f"MH-CSC-{body.phone[-4:]}" if body.role == "assistant" else None)
        db.add(user)
        db.flush()
    if user.active is False:
        raise HTTPException(403, "This account is disabled")
    token = secrets.token_hex(24)
    db.add(models.Session(token=token, user_id=user.id, expires_at=utcnow() + timedelta(days=config.SESSION_DAYS)))
    db.commit()
    db.refresh(user)
    return {"token": token, "user": user_out(user, db)}


@router.get("/me")
def me(user=Depends(current_user), db: DBSession = Depends(get_db)):
    return user_out(user, db)


@router.post("/logout")
def logout(token: str = Depends(current_token), user=Depends(current_user), db: DBSession = Depends(get_db)):
    db.query(models.Session).filter_by(token=token).delete()
    db.commit()
    return {"ok": True}
