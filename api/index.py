import os
import sys
from pathlib import Path

# Set Vercel environment flag
os.environ.setdefault("VERCEL", "1")

# Add backend directory and repository root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Ensure fallback configurations for serverless environment (/tmp is writable)
if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/adivasisetu.db"
if not os.environ.get("UPLOAD_DIR"):
    os.environ["UPLOAD_DIR"] = "/tmp/uploads"
if not os.environ.get("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "adivasisetu-prod-secret-sih2026"
if "DEMO_MODE" not in os.environ:
    os.environ["DEMO_MODE"] = "true"

from app.main import app, bootstrap
from app.database import SessionLocal
from app.migrate import ensure_schema

# Auto-initialize database schema and seed data on serverless cold start
try:
    ensure_schema()
    with SessionLocal() as db:
        bootstrap(db)
except Exception as e:
    import logging
    logging.getLogger("adivasisetu").warning("Vercel cold start database setup notice: %s", e)
