"""Document photo quality check: resolution, brightness and blur (variance of the Laplacian)."""
import io
import numpy as np
from PIL import Image


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
    g = np.asarray(img, dtype=np.float32)
    mean = float(g.mean())
    if mean < 60:
        score -= 25
        issues.append("Too dark — take the photo in daylight")
    elif mean > 235:
        score -= 20
        issues.append("Overexposed — avoid flash or direct sunlight on the paper")

    if g.shape[0] > 2 and g.shape[1] > 2:
        lap = (g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:] - 4 * g[1:-1, 1:-1])
        sharpness = float(lap.var())
        if sharpness < 40:
            score -= 45
            issues.append("Blurry — hold the phone steady and tap to focus")
        elif sharpness < 100:
            score -= 15
            issues.append("Slightly blurry — text may be hard to read")

    return {"score": max(0, min(100, score)), "issues": issues}
