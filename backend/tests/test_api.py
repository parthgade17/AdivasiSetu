import io
import pytest
from .conftest import auth_headers, sharp_image, blurry_image, STUDENT, ADMIN


def test_health_and_config(client):
    assert client.get("/api/health").json() == {"status": "ok", "database": "up"}
    cfg = client.get("/api/config").json()
    assert cfg["demoMode"] is True


def test_unknown_api_route_is_json_404(client):
    r = client.get("/api/nope")
    assert r.status_code == 404 and "detail" in r.json()


# ---------------- OTP login ----------------
def test_otp_wrong_code_and_lockout(client):
    client.post("/api/auth/send-otp", json={"phone": "9812345678", "role": "student"})
    for _ in range(5):
        r = client.post("/api/auth/verify-otp", json={"phone": "9812345678", "role": "student", "otp": "000000"})
        assert r.status_code == 400
    r = client.post("/api/auth/verify-otp", json={"phone": "9812345678", "role": "student", "otp": "000000"})
    assert r.status_code == 429


def test_otp_cannot_be_reused(client):
    sent = client.post("/api/auth/send-otp", json={"phone": "9812345679", "role": "student"}).json()
    ok = client.post("/api/auth/verify-otp", json={"phone": "9812345679", "role": "student", "otp": sent["demoOtp"]})
    assert ok.status_code == 200
    again = client.post("/api/auth/verify-otp", json={"phone": "9812345679", "role": "student", "otp": sent["demoOtp"]})
    assert again.status_code == 400


def test_new_student_gets_random_otp_not_demo_code(client):
    sent = client.post("/api/auth/send-otp", json={"phone": "9811111111", "role": "student"}).json()
    assert len(sent["demoOtp"]) == 6 and sent["demoOtp"] != "123456"


def test_phone_validation(client):
    assert client.post("/api/auth/send-otp", json={"phone": "12345", "role": "student"}).status_code == 400
    assert client.post("/api/auth/send-otp", json={"phone": "1234567890", "role": "student"}).status_code == 400


def test_logout_invalidates_token(client, student):
    assert client.get("/api/auth/me", headers=student).status_code == 200
    client.post("/api/auth/logout", headers=student)
    assert client.get("/api/auth/me", headers=student).status_code == 401


def test_requires_auth(client):
    assert client.get("/api/applications").status_code == 401
    assert client.get("/api/admin/summary").status_code == 401


def test_role_isolation(client, student, teacher):
    assert client.get("/api/admin/summary", headers=student).status_code == 403
    assert client.get("/api/admin/summary", headers=teacher).status_code == 403
    assert client.get("/api/assisted/students", headers=student).status_code == 403


# ---------------- schemes / eligibility / applications ----------------
def test_schemes_listing_hides_inactive_from_public(client, admin):
    assert len(client.get("/api/schemes").json()) == 6
    sid = client.get("/api/schemes").json()[0]["id"]
    client.post(f"/api/admin/schemes/{sid}/toggle", headers=admin)
    assert len(client.get("/api/schemes").json()) == 5
    assert len(client.get("/api/schemes?include_inactive=true").json()) == 5  # anonymous: ignored
    assert len(client.get("/api/schemes?include_inactive=true", headers=admin).json()) == 6


def test_eligibility_check(client, student):
    r = client.post("/api/eligibility/check", headers=student, json={"profile": {"course": "Class 9–10", "income": "100000", "state": "Maharashtra"}, "save": True})
    names = [s["name"] for s in r.json()["eligible"]]
    assert any("Pre-Matric" in n for n in names)
    assert not any("Post-Matric" in n for n in names)


def test_apply_flow_and_duplicate(client, student):
    schemes = client.get("/api/schemes", headers=student).json()
    nfs = next(s for s in schemes if "Fellowship" in s["name"])
    client.put("/api/profile", headers=student, json={"profile": {"course": "Ph.D / Research", "income": "300000"}})
    r = client.post("/api/applications", headers=student, json={"scheme_id": nfs["id"], "client_ref": "abc-1"})
    assert r.status_code == 200, r.text
    code = r.json()["id"]
    again = client.post("/api/applications", headers=student, json={"scheme_id": nfs["id"], "client_ref": "abc-1"})
    assert again.json()["id"] == code  # offline re-sync is idempotent
    dup = client.post("/api/applications", headers=student, json={"scheme_id": nfs["id"]})
    assert dup.status_code == 409


def test_cannot_apply_when_not_eligible(client, student):
    schemes = client.get("/api/schemes", headers=student).json()
    nfs = next(s for s in schemes if "Fellowship" in s["name"])  # needs Ph.D; seeded student is UG
    r = client.post("/api/applications", headers=student, json={"scheme_id": nfs["id"]})
    assert r.status_code == 400 and "Not eligible" in r.json()["detail"]


def test_cannot_apply_after_deadline(client, student, admin):
    s = next(x for x in client.get("/api/schemes", headers=admin).json() if "Post-Matric" in x["name"])
    body = {k: s[k] for k in ("name", "ministry", "amount", "period", "type", "category", "states", "link", "description", "criteria")}
    body.update(deadline="2020-01-01", amount_value=s["amountValue"], documents=s["documentKeys"],
                courses=s["rules"].get("courses", []), max_income=s["rules"].get("max_income"))
    assert client.put(f"/api/admin/schemes/{s['id']}", headers=admin, json=body).status_code == 200
    # Ramesh already has an active Post-Matric application; remove the duplicate check by using a fresh scheme id path
    r = client.post("/api/applications", headers=student, json={"scheme_id": s["id"]})
    assert r.status_code == 400 and "deadline" in r.json()["detail"].lower()


# ---------------- assisted mode ----------------
def test_assistant_only_sees_own_students(client, teacher, student):
    mine = client.get("/api/assisted/students", headers=teacher).json()
    assert len(mine) >= 3
    ramesh_id = client.get("/api/profile", headers=student).json()["studentId"]
    assert client.get(f"/api/applications?student_id={ramesh_id}", headers=teacher).status_code == 403
    sid = mine[0]["id"]
    assert client.get(f"/api/applications?student_id={sid}", headers=teacher).status_code == 200


def test_assistant_creates_student(client, teacher):
    r = client.post("/api/assisted/students", headers=teacher, json={"name": "Asha Kumre", "phone": "9000012345"})
    assert r.status_code == 200 and r.json()["name"] == "Asha Kumre"
    assert client.post("/api/assisted/students", headers=teacher, json={"name": "  "}).status_code == 400


# ---------------- documents ----------------
def test_document_upload_view_replace_delete(client, student):
    good = sharp_image()
    r = client.post("/api/documents/upload", headers=student, data={"doc_type": "domicile"}, files={"file": ("dom.png", good, "image/png")})
    assert r.status_code == 200, r.text
    assert r.json()["result"]["status"] in ("verified", "pending_review")
    f = client.get("/api/documents/domicile/file", headers=student)
    assert f.status_code == 200 and f.headers["content-type"] == "image/png" and f.content == good
    # replacing keeps exactly one stored file
    client.post("/api/documents/upload", headers=student, data={"doc_type": "domicile"}, files={"file": ("dom2.png", good, "image/png")})
    docs = client.delete("/api/documents/domicile", headers=student).json()
    assert next(d for d in docs if d["id"] == "domicile")["status"] == "missing"
    assert client.get("/api/documents/domicile/file", headers=student).status_code == 404


def test_blurry_upload_flagged(client, student):
    r = client.post("/api/documents/upload", headers=student, data={"doc_type": "bonafide"}, files={"file": ("b.png", blurry_image(), "image/png")})
    assert r.json()["result"]["status"] == "quality_issue"


def test_upload_rejects_non_documents_and_big_files(client, student):
    r = client.post("/api/documents/upload", headers=student, data={"doc_type": "domicile"}, files={"file": ("x.png", b"<script>alert(1)</script>", "image/png")})
    assert r.status_code == 400
    big = b"%PDF-" + b"0" * (6 * 1024 * 1024)
    r = client.post("/api/documents/upload", headers=student, data={"doc_type": "domicile"}, files={"file": ("big.pdf", big, "application/pdf")})
    assert r.status_code == 413
    r = client.post("/api/documents/upload", headers=student, data={"doc_type": "nonsense"}, files={"file": ("a.pdf", b"%PDF-1.4 x", "application/pdf")})
    assert r.status_code == 400


def test_documents_are_private(client, student, teacher):
    client.post("/api/documents/upload", headers=student, data={"doc_type": "domicile"}, files={"file": ("d.png", sharp_image(), "image/png")})
    ramesh_id = client.get("/api/profile", headers=student).json()["studentId"]
    assert client.get(f"/api/documents/domicile/file?student_id={ramesh_id}", headers=teacher).status_code == 403
    assert client.get("/api/documents/domicile/file").status_code == 401


def test_digilocker_mock(client, student):
    docs = client.post("/api/documents/digilocker", headers=student).json()
    assert next(d for d in docs if d["id"] == "domicile")["status"] == "verified"


# ---------------- admin ----------------
def test_admin_review_flow(client, admin, student):
    open_apps = client.get("/api/admin/applications", headers=admin).json()
    assert open_apps
    code = open_apps[0]["id"]
    adv = client.post(f"/api/admin/applications/{code}/advance", headers=admin)
    assert adv.status_code == 200
    rej = client.post(f"/api/admin/applications/{code}/reject", headers=admin, json={"reason": "Income Limit Exceeded"})
    assert rej.json()["status"] == "rejected"
    assert client.post(f"/api/admin/applications/{code}/reject", headers=admin, json={"reason": "x"}).status_code == 400
    assert client.get("/api/admin/summary", headers=admin).status_code == 200


def test_admin_scheme_create_update_validate(client, admin):
    body = {"name": "Test Scheme", "deadline": "2027-01-31", "amount_value": 10000, "category": "Pre-Matric", "courses": ["Class 9–10"], "max_income": 200000, "documents": ["aadhaar"]}
    r = client.post("/api/admin/schemes", headers=admin, json=body)
    assert r.status_code == 200, r.text
    sid = r.json()["id"]
    assert client.put(f"/api/admin/schemes/{sid}", headers=admin, json={**body, "name": "Renamed"}).json()["name"] == "Renamed"
    assert client.post("/api/admin/schemes", headers=admin, json={**body, "deadline": "31/01/2027"}).status_code == 400
    assert client.post("/api/admin/schemes", headers=admin, json={**body, "documents": ["bogus"]}).status_code == 400


def test_operator_management(client, admin):
    r = client.post("/api/admin/operators", headers=admin, json={"phone": "9555555555", "name": "New Op"})
    assert r.status_code == 200
    uid = r.json()["id"]
    assert client.post("/api/admin/operators", headers=admin, json={"phone": "9555555555"}).status_code == 409
    assert client.post(f"/api/admin/operators/{uid}/toggle", headers=admin).json()["active"] is False
    assert any(o["id"] == uid for o in client.get("/api/admin/operators", headers=admin).json())


def test_demo_refresh_advances_stage(client, student):
    client.put("/api/profile", headers=student, json={"profile": {"course": "Class 11–12", "income": "100000"}})
    # Ramesh's seeded Post-Matric application is already disbursed, so use the rejected-then-reapply scheme
    maha = next(s for s in client.get("/api/schemes", headers=student).json() if "MahaDBT" in s["name"])
    r = client.post("/api/applications", headers=student, json={"scheme_id": maha["id"]})
    assert r.status_code == 200, r.text
    code = r.json()["id"]
    r2 = client.post(f"/api/applications/{code}/refresh", headers=student)
    assert r2.status_code == 200 and r2.json()["stage"] == "institute_verified"
