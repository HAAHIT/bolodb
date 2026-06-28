import re
import functools

# Caching this regex-heavy function speeds up schema linking and similarity searches significantly.
# Returning an immutable frozenset prevents callers from mutating the cached collection.
@functools.lru_cache(maxsize=2048)
def _tokens(text):
    return frozenset(t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(t) > 1)
