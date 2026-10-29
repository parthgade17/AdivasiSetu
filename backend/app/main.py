import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from . import config, models
from .database import Base, engine, SessionLocal
from .migrate import ensure_schema
from .seed import seed_schemes, seed_demo, DEMO_USERS
from .routers import auth, students, schemes, applications, documents, notifications, admin

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("adivasisetu")


def startup_checks():
    if config.IS_PROD and config.SECRET_KEY == "dev-only-change-me":
        raise RuntimeError("Set SECRET_KEY to a long random value when APP_ENV=production")
    if config.IS_PROD and config.DEMO_MODE:
        log.warning("DEMO_MODE is on in production: demo accounts and the reset endpoint are exposed")
    if not config.DEMO_MODE and config.SMS_PROVIDER == "console":
        log.warning("SMS_PROVIDER=console: OTPs are printed to the server log, not sent by SMS")
    if not config.DEMO_MODE and not config.ADMIN_PHONES and not os.getenv("SKIP_ADMIN_CHECK"):
        log.warning("ADMIN_PHONES is empty: nobody can sign in as admin")


def bootstrap(db):
    if config.SEED_SCHEMES:
        seed_schemes(db)
    if config.DEMO_MODE:
        seed_demo(db)
    for phone in config.ADMIN_PHONES:
        if not db.query(models.User).filter_by(phone=phone, role="admin").first():
            db.add(models.User(phone=phone, role="admin", name="Admin Officer"))
    for phone in config.ASSISTANT_PHONES:
        if not db.query(models.User).filter_by(phone=phone, role="assistant").first():
            db.add(models.User(phone=phone, role="assistant", name="CSC Operator", csc_id=f"MH-CSC-{phone[-4:]}"))
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_checks()
    # Several gunicorn workers start at once; on Postgres a lock makes only one run schema setup at a time.
    with engine.connect() as lock:
        pg = engine.dialect.name == "postgresql"
        if pg:
            lock.execute(text("SELECT pg_advisory_lock(727272)"))
        try:
            ensure_schema()
            with SessionLocal() as db:
                bootstrap(db)
        finally:
            if pg:
                lock.execute(text("SELECT pg_advisory_unlock(727272)"))
                lock.commit()
    yield


app = FastAPI(title="AdivasiSetu API", version="1.1.0", lifespan=lifespan,
              description="Unified scholarship platform for Scheduled Tribe students",
              docs_url="/docs" if not config.IS_PROD or config.DEMO_MODE else None,
              redoc_url=None)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS if config.CORS_ORIGINS else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_logging(request: Request, call_next):
    start = time.perf_counter()
    try:
        resp = await call_next(request)
    except Exception:
        log.exception("Unhandled error on %s %s", request.method, request.url.path)
        resp = JSONResponse({"detail": "Something went wrong on our side. Please try again."}, status_code=500)
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("X-Frame-Options", "DENY")
    resp.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    resp.headers.setdefault("Permissions-Policy", "microphone=(self), camera=(self), geolocation=()")
    if config.IS_PROD:
        resp.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    if request.url.path.startswith("/api/"):
        resp.headers.setdefault("Cache-Control", "no-store")
        log.info("%s %s -> %s (%.0f ms)", request.method, request.url.path, resp.status_code, (time.perf_counter() - start) * 1000)
    return resp


for r in (auth, students, schemes, applications, documents, notifications, admin):
    app.include_router(r.router, prefix="/api")


@app.get("/api/health")
def health():
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse({"status": "error", "database": "down"}, status_code=503)
    return {"status": "ok", "database": "up"}


@app.get("/api")
def api_root():
    return {"status": "ok", "message": "AdivasiSetu API is running", "docs": "/docs"}


@app.get("/api/config")
def public_config():
    """Lets the frontend adapt: demo shortcuts only appear when the server is in demo mode."""
    return {"demoMode": config.DEMO_MODE, "digilockerMode": config.DIGILOCKER_MODE, "otpResendSeconds": config.OTP_RESEND_SECONDS,
            "maxUploadMb": config.MAX_UPLOAD_MB}


if config.DEMO_MODE:
    from fastapi import Depends
    from sqlalchemy.orm import Session as DBSession
    from .database import get_db

    @app.get("/api/demo/accounts")
    def demo_accounts():
        return [{"role": role, "phone": phone, "name": name, "otp": "123456"} for role, (phone, name) in DEMO_USERS.items()]

    @app.post("/api/demo/reset")
    def reset(db: DBSession = Depends(get_db)):
        """Wipe and re-seed demo data. Run this before presenting."""
        db.close()
        Base.metadata.drop_all(bind=engine)
        ensure_schema()
        with SessionLocal() as fresh:
            bootstrap(fresh)
        return {"ok": True}


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse({"detail": getattr(exc, "detail", "Not found")}, status_code=404)


# ---- Serve the built React app from the same server (single deployable unit) ----
DIST = Path(config.FRONTEND_DIST)
if (DIST / "index.html").is_file():
    if (DIST / "assets").is_dir():
        app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        if path.startswith("api/") or path == "api":
            raise HTTPException(404, "Not found")
        target = (DIST / path).resolve()
        if path and target.is_file() and DIST.resolve() in target.parents:
            headers = {"Cache-Control": "no-cache"} if path in ("sw.js", "manifest.webmanifest") else {}
            return FileResponse(target, headers=headers)
        return FileResponse(DIST / "index.html", headers={"Cache-Control": "no-cache"})
else:
    log.info("No frontend build found at %s; running API only", DIST)
