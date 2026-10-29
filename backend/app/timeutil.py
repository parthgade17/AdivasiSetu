from datetime import datetime, timezone


def utcnow() -> datetime:
    """Naive UTC timestamp (datetime.utcnow() is deprecated in newer Python)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
