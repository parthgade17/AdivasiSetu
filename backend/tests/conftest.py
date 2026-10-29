import io
import os
import tempfile
import pytest

_tmp = tempfile.mkdtemp()
os.environ.update({
    "APP_ENV": "development", "DEMO_MODE": "true", "DATABASE_URL": f"sqlite:///{_tmp}/test.db",
    "UPLOAD_DIR": f"{_tmp}/uploads", "SECRET_KEY": "test-secret", "OTP_RESEND_SECONDS": "0",
    "FRONTEND_DIST": f"{_tmp}/no-dist",
})

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402
from app.main import app  # noqa: E402

STUDENT, TEACHER, ADMIN = "9876543210", "9123456780", "9000000001"


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def fresh_data(client):
    client.post("/api/demo/reset")


def auth_headers(client, phone, role):
    sent = client.post("/api/auth/send-otp", json={"phone": phone, "role": role}).json()
    r = client.post("/api/auth/verify-otp", json={"phone": phone, "role": role, "otp": sent["demoOtp"]})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture
def student(client):
    return auth_headers(client, STUDENT, "student")


@pytest.fixture
def teacher(client):
    return auth_headers(client, TEACHER, "assistant")


@pytest.fixture
def admin(client):
    return auth_headers(client, ADMIN, "admin")


def sharp_image(fmt="PNG", size=(900, 700)):
    """Image with plenty of edges so the blur check passes."""
    img = Image.new("RGB", size, "white")
    d = ImageDraw.Draw(img)
    for i in range(0, size[0], 12):
        d.line([(i, 0), (i, size[1])], fill="black" if (i // 12) % 2 else "gray", width=2)
    for j in range(0, size[1], 17):
        d.line([(0, j), (size[0], j)], fill="black", width=1)
    buf = io.BytesIO()
    img.save(buf, fmt)
    return buf.getvalue()


def blurry_image():
    buf = io.BytesIO()
    Image.new("RGB", (900, 700), (128, 128, 128)).save(buf, "PNG")
    return buf.getvalue()
