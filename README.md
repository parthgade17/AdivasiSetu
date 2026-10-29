# AdivasiSetu — Unified Scholarship Platform for ST Students 

One front door to every scholarship for Scheduled Tribe students: fill details once, see every scheme you qualify for, apply, upload documents and track payment, even with poor connectivity, in English, Hindi or Marathi.

**Stack:** React 19 + Vite (frontend, installable PWA) · Python FastAPI + SQLAlchemy, SQLite for development and PostgreSQL in production (backend) · Pillow/NumPy (document quality check)

## Run it locally (development)

You need Node.js 20+ and Python 3.10+. Demo mode is on by default in development.

**1. Backend** (terminal 1)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs. The database is created and the demo data is added on first start.

**2. Frontend** (terminal 2, project root)
```bash
npm install
npm run dev
```
Open http://localhost:5173. The dev server forwards `/api` to port 8000, so no `.env` is needed.

**Tests:** `cd backend && pip install -r requirements-dev.txt && pytest`

## Deploy (one command)

```bash
cp .env.example .env      # Windows: copy .env.example .env
# edit .env: set SECRET_KEY, POSTGRES_PASSWORD, ADMIN_PHONES, and an SMS provider
docker compose up --build -d
```
The app, the API and PostgreSQL start together at http://localhost:8000 (put it behind HTTPS on a real server). The Docker image builds the React app and serves it from the same server, so there is nothing else to host.

**Render (free tier):** push the repo to GitHub, then Render > New > Blueprint > pick the repo. `render.yaml` creates the database and the web service. Set `ADMIN_PHONES` and the SMS keys in the dashboard. Free web services have no persistent disk, so uploaded documents are lost on redeploy; use the `starter` plan with the disk block in `render.yaml` to keep them.

**Any VPS or cloud VM:** install Docker, copy the project, run the commands above, and put Caddy or Nginx in front for HTTPS.

### Production switches (environment variables)

| Variable | Meaning |
|---|---|
| `APP_ENV=production` | Refuses to start with the default `SECRET_KEY`, hides `/docs`, sends HSTS |
| `DEMO_MODE=false` | No demo accounts, no fixed OTP, no demo reset, no "advance status" button, no simulated offline switch |
| `SECRET_KEY` | Long random string used to hash OTPs |
| `ADMIN_PHONES` / `ASSISTANT_PHONES` | Mobile numbers allowed to sign in as admin / CSC operator. More operators can be added later from the admin dashboard |
| `SMS_PROVIDER` | `console` (OTP printed in the server log, for testing), `msg91` or `twilio`, with the keys listed in `.env.example` |
| `DATABASE_URL` | PostgreSQL URL. Set automatically by `docker compose` and Render |
| `CORS_ORIGINS` | Only needed if the frontend is hosted on another domain (then also set `VITE_API_URL` at build time) |
| `DIGILOCKER_MODE` | `mock` (default, labelled "simulated" in the UI) or anything else to switch the DigiLocker button off |

### Before real students use it

1. Set `SMS_PROVIDER` to `msg91` or `twilio` and send yourself a test OTP. Indian SMS needs DLT registration of the sender and template with your provider.
2. Sign in with a number from `ADMIN_PHONES`, open the admin dashboard, check the scheme list and fix the amounts, deadlines and income limits against the official portals. The seeded values are sample data.
3. Back up the PostgreSQL volume and the uploads volume.
4. Document upload accepts JPG, PNG and PDF up to 5 MB and checks the real file type, not the extension.

## What the production build does

- OTP login: random 6-digit codes, stored hashed, valid 5 minutes, 5 wrong attempts then locked, resend limit, 6 codes per hour per number. Sessions expire after 30 days and logout ends the current session only.
- Admin and CSC operator accounts cannot self-register outside demo mode.
- Applying is checked on the server: scheme deadline, eligibility rules, duplicates, and an offline-sync key so a retried submission never creates two applications.
- Uploaded documents are private to the student, their registered operator and admins; view them from the Documents page.
- Admin can create and edit schemes, hide or show them, and add or disable CSC operators.
- Missing database columns are added automatically on start (`app/migrate.py`). For renames or drops, introduce Alembic.

## Demo mode (`DEMO_MODE=true`, the default in development)

Demo accounts use OTP `123456`; any other number gets a random OTP that is shown on screen.

| Role | Mobile | What to show |
|---|---|---|
| Student | 9876543210 | Eligibility, apply, documents, tracking |
| Teacher / CSC operator | 9123456780 | Assisted mode: apply for students without phones |
| Admin | 9000000001 | Review queue, district analytics |

On the login page, "Use demo number" fills the number for the selected role. Before presenting, reset all data with `POST http://localhost:8000/api/demo/reset` (or the button in `/docs`).

## Demo script (about 4 minutes)

1. **Student: eligibility.** Log in as student → Eligibility Checker (details are pre-filled from the profile) → results show matching schemes with reasons. Press **Listen** to hear a scheme read aloud.
2. **Apply.** Press Apply Now on MahaDBT (the earlier one was rejected) → My Applications shows the new application with its timeline.
3. **Document check.** Documents → upload a blurry photo → rejected with a quality score and the reason. Press **Connect DigiLocker** → certificates arrive verified.
4. **Offline mode.** Click **Online** in the sidebar to simulate no network → apply for a scheme → it shows "Waiting to sync". Click again → it is submitted automatically.
5. **Language.** Switch to हिं / मर.
6. **Assisted mode.** Log in as teacher → pick Raju Meshram → the banner shows you are applying on his behalf.
7. **Admin.** Log in as admin → the new application is at the top of the review queue → Verify / Sanction / Disburse or Reject with a reason. The student gets a notification at each step, and the analytics update.
8. **Phone view.** Open on a phone (or narrow the browser) → bottom navigation; install via "Add to Home screen".

## Project structure

```
backend/app/
  main.py               app setup, CORS, demo reset
  models.py             users, students, schemes, applications, documents, notifications
  data.py               courses, document types, scheme rules, baseline analytics
  seed.py               demo data
  services/eligibility.py   rule engine (course, income, state)
  services/doc_quality.py   blur / brightness / resolution check
  services/workflow.py      application stages + notifications
  routers/              auth, students, schemes, applications, documents, notifications, admin
src/
  context/AppContext.jsx    shared state, offline cache and submission queue
  services/api.js           all backend calls
  services/eligibility.js   offline copy of the rule engine
  services/voice.js         read-aloud and voice search
  i18n.js                   English / Hindi / Marathi
  components/               Layout, BottomNav, ReviewQueue, ListenButton, Toast
  pages/                    one file per screen
public/sw.js                service worker (opens without network)
```

## Main API endpoints

`POST /api/auth/send-otp` · `POST /api/auth/verify-otp` · `GET /api/schemes` · `POST /api/eligibility/check` · `GET|PUT /api/profile` · `GET|POST /api/applications` · `POST /api/documents/upload` · `POST /api/documents/digilocker` · `GET /api/notifications` · `GET|POST /api/assisted/students` · `GET /api/admin/summary` · `POST /api/admin/applications/{id}/advance|reject`

Assistants and admins act on a student by adding `?student_id=`.

## What is mocked in this prototype, and the production path

| Prototype | Production |
|---|---|
| Fixed demo OTP (demo mode only) | Real SMS is built in: set `SMS_PROVIDER` |
| DigiLocker fetch is simulated | DigiLocker Requester API (needs partner onboarding) |
| Status steps advanced by admin buttons | NSP / MahaDBT / PFMS status APIs (needs ministry access) |
| Browser speech for read-aloud | Bhashini ASR/TTS, adding tribal languages (Bhili, Gondi, Santali) |
| SQLite (development) | PostgreSQL (Docker / Render, built in) |
| Baseline district figures are sample data | Real enrolment data from the state tribal department |

Scheme amounts, income limits and deadlines are sample data. Verify them on scholarships.gov.in, tribal.nic.in and mahadbt.maharashtra.gov.in.
