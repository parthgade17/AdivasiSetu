"""Document photo quality check: resolution, brightness and blur.
Uses only Pillow (no NumPy), so it installs on any Windows Python."""
import io
from PIL import Image, ImageFilter, ImageStat

LAPLACIAN = ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], scale=1, offset=128)


def check_quality(content: bytes, content_type: str) -> dict:
    issues = []
    if len(content) > 5 * 1024 * 1024:
        return {"score": 0, "issues": ["File is larger than 5 MB"]}
    if content_type == "application/pdf" or content[:4] == b"%PDF":
        return {"score": 90, "issues": []}
    try:
        img = Image.open(io.BytesIO(content)).convert("L")
    except Exception:
        return {"score": 0, "issues": ["Could not read this file. Upload a JPG, PNG or PDF."]}

    score = 100
    w, h = img.size
    if min(w, h) < 500:
        score -= 25
        issues.append("Low resolution — move the camera closer to the document")

    img.thumbnail((600, 600))
    mean = ImageStat.Stat(img).mean[0]
    if mean < 60:
        score -= 25
        issues.append("Too dark — take the photo in daylight")
    elif mean > 235:
        score -= 20
        issues.append("Overexposed — avoid flash or direct sunlight on the paper")

    sharpness = ImageStat.Stat(img.filter(LAPLACIAN)).var[0]
    if sharpness < 40:
        score -= 45
        issues.append("Blurry — hold the phone steady and tap to focus")
    elif sharpness < 100:
        score -= 15
        issues.append("Slightly blurry — text may be hard to read")

    return {"score": max(0, min(100, score)), "issues": issues}
