import re
from datetime import datetime


def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_hex_color(color):
    """Validate hex color format (#RRGGBB)."""
    pattern = r'^#[0-9A-Fa-f]{6}$'
    return re.match(pattern, color) is not None


def calculate_duration_minutes(start_time, end_time):
    """Calculate duration in minutes between two datetime objects."""
    if not isinstance(start_time, datetime) or not isinstance(end_time, datetime):
        return None
    if end_time <= start_time:
        return None
    delta = end_time - start_time
    return int(delta.total_seconds() / 60)


def validate_username(username):
    """Validate username (3-20 chars, alphanumeric and underscore)."""
    if not username or len(username) < 3 or len(username) > 20:
        return False
    pattern = r'^[a-zA-Z0-9_]+$'
    return re.match(pattern, username) is not None


def validate_password(password):
    """Validate password (6+ chars)."""
    return password and len(password) >= 6


def normalize_string(s):
    """Normalize string for case-insensitive comparison."""
    return s.lower().strip() if s else ''
