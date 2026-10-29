import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session as DBSession
from .. import config, models
from ..data import DOC_TYPES, DIGILOCKER_DOCS
from ..database import get_db
from ..deps import current_user, resolve_student
from ..services.doc_quality import check_quality
from ..services.serializers import document_list
from ..services.workflow import notify
from ..timeutil import utcnow

router = APIRouter(prefix="/documents", tags=["documents"])
UPLOAD_DIR = config.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_BYTES = config.MAX_UPLOAD_MB * 1024 * 1024
KINDS = {"jpg": (".jpg", "image/jpeg"), "png": (".png", "image/png"), "pdf": (".pdf", "application/pdf")}


def sniff(content: bytes) -> Optional[str]:
    """Identify the real file type from its first bytes, not from the filename."""
    if content[:3] == b"\xff\xd8\xff":
        return "jpg"
    if content[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if content[:5] == b"%PDF-":
        return "pdf"
    return None


def _list(db, s):
    return document_list(db.query(models.Document).filter_by(student_id=s.id).all())


def _remove_file(path):
    if path and os.path.isfile(path):
        try:
            os.remove(path)
        except OSError:
            pass


@router.get("")
def list_docs(student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    return _list(db, resolve_student(db, user, student_id))


@router.post("/upload")
async def upload(doc_type: str = Form(...), file: UploadFile = File(...), student_id: Optional[int] = Form(None),
                 user=Depends(current_user), db: DBSession = Depends(get_db)):
    if doc_type not in DOC_TYPES:
        raise HTTPException(400, "Unknown document type")
    s = resolve_student(db, user, student_id)
    content = await file.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(413, f"File is larger than {config.MAX_UPLOAD_MB} MB")
    kind = sniff(content)
    if not kind:
        raise HTTPException(400, "Upload a JPG, PNG or PDF file")
    q = check_quality(content, KINDS[kind][1])
    path = os.path.join(UPLOAD_DIR, f"{s.id}_{doc_type}_{uuid.uuid4().hex[:10]}{KINDS[kind][0]}")
    with open(path, "wb") as f:
        f.write(content)
    status = "verified" if q["score"] >= 80 else ("pending_review" if q["score"] >= 60 else "quality_issue")
    d = db.query(models.Document).filter_by(student_id=s.id, doc_type=doc_type).first()
    if not d:
        d = models.Document(student_id=s.id, doc_type=doc_type)
        db.add(d)
    else:
        _remove_file(d.stored_path)
    d.filename = os.path.basename(file.filename or f"{doc_type}{KINDS[kind][0]}")[:200]
    d.stored_path, d.status, d.quality, d.issues, d.source = path, status, q["score"], q["issues"], "upload"
    d.uploaded_at = utcnow()
    if status == "quality_issue":
        notify(db, s.id, "reminder", f"Re-upload needed: {DOC_TYPES[doc_type][0]}",
               f"The photo scored {q['score']}% quality. {' '.join(q['issues'])}")
    db.commit()
    return {"result": {"docType": doc_type, "status": status, "quality": q["score"], "issues": q["issues"]},
            "documents": _list(db, s)}


@router.get("/{doc_type}/file")
def download(doc_type: str, student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    """Return the uploaded file. Access follows the same rules as every other student endpoint."""
    s = resolve_student(db, user, student_id)
    d = db.query(models.Document).filter_by(student_id=s.id, doc_type=doc_type).first()
    if not d or not d.stored_path or not os.path.isfile(d.stored_path):
        raise HTTPException(404, "No file stored for this document")
    media = {".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf"}.get(os.path.splitext(d.stored_path)[1], "application/octet-stream")
    return FileResponse(d.stored_path, media_type=media, filename=d.filename or None, content_disposition_type="inline",
                        headers={"Cache-Control": "private, no-store"})


@router.post("/digilocker")
def digilocker(student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    """Simulated DigiLocker pull. Real integration needs DigiLocker partner (Requester API) credentials."""
    if config.DIGILOCKER_MODE != "mock":
        raise HTTPException(501, "DigiLocker is not connected on this server. Please upload the documents instead.")
    s = resolve_student(db, user, student_id)
    for key in DIGILOCKER_DOCS:
        d = db.query(models.Document).filter_by(student_id=s.id, doc_type=key).first()
        if not d:
            d = models.Document(student_id=s.id, doc_type=key)
            db.add(d)
        else:
            _remove_file(d.stored_path)
        d.filename, d.stored_path, d.status, d.quality, d.issues, d.source = f"DigiLocker_{key}.pdf", None, "verified", 100, [], "digilocker"
        d.uploaded_at = utcnow()
    notify(db, s.id, "info", "Documents fetched from DigiLocker",
           "ST certificate, domicile certificate and Aadhaar were fetched and verified from DigiLocker.")
    db.commit()
    return _list(db, s)


@router.delete("/{doc_type}")
def delete(doc_type: str, student_id: Optional[int] = None, user=Depends(current_user), db: DBSession = Depends(get_db)):
    s = resolve_student(db, user, student_id)
    d = db.query(models.Document).filter_by(student_id=s.id, doc_type=doc_type).first()
    if d:
        _remove_file(d.stored_path)
        db.delete(d)
        db.commit()
    return _list(db, s)
