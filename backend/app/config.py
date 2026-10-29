"""All settings come from environment variables. See .env.example."""
import os
from pathlib import Path


def _bool(name: str, default: bool) -> bool:
    v = os.getenv(name)
    return default if v is None else v.strip().lower() in ("1", "true", "yes", "on")


def _list(name: str) -> list[str]:
    return [x.strip() for x in os.getenv(name, "").split(",") if x.strip()]


def _db_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///./adivasisetu.db")
    # Hosts such as Render/Heroku hand out postgres:// URLs; SQLAlchemy needs a driver name.
    if url.startswith("postgres://"):
        url = "postgresql+psycopg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


ENV = os.getenv("APP_ENV", "development").lower()
IS_PROD = ENV == "production"
# Demo mode = fixed OTP 123456 for demo accounts, demo data, reset endpoint, "advance status" buttons.
DEMO_MODE = _bool("DEMO_MODE", not IS_PROD)
DATABASE_URL = _db_url()
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")
CORS_ORIGINS = _list("CORS_ORIGINS")  # empty = same-origin only (the Docker setup serves the UI itself)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "5"))
FRONTEND_DIST = os.getenv("FRONTEND_DIST", str(Path(__file__).resolve().parents[2] / "dist"))

OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", "300"))
OTP_RESEND_SECONDS = int(os.getenv("OTP_RESEND_SECONDS", "30"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_MAX_PER_HOUR = int(os.getenv("OTP_MAX_PER_HOUR", "6"))
SESSION_DAYS = int(os.getenv("SESSION_DAYS", "30"))

# sms: console (prints the OTP to the server log) | msg91 | twilio
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "console").lower()
MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY", "")
MSG91_TEMPLATE_ID = os.getenv("MSG91_TEMPLATE_ID", "")
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM = os.getenv("TWILIO_FROM", "")

# Admin and CSC-operator accounts cannot self-register outside demo mode.
ADMIN_PHONES = _list("ADMIN_PHONES")
ASSISTANT_PHONES = _list("ASSISTANT_PHONES")

# DigiLocker: "mock" simulates the fetch; real integration needs DigiLocker partner credentials.
DIGILOCKER_MODE = os.getenv("DIGILOCKER_MODE", "mock").lower()
SEED_SCHEMES = _bool("SEED_SCHEMES", True)
