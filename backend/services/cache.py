from datetime import datetime, timedelta

_cache: dict = {}


def get(key: str):
    if key in _cache:
        val, exp = _cache[key]
        if datetime.now() < exp:
            return val
        del _cache[key]
    return None


def set(key: str, value, ttl_minutes: int = 60):
    _cache[key] = (value, datetime.now() + timedelta(minutes=ttl_minutes))
