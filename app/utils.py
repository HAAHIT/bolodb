import re
import functools

# Memoize tokenization to avoid repeating expensive regex operations on frequently used strings
# like table names or terms. Returns a frozenset to prevent unintended mutations by callers.
@functools.lru_cache(maxsize=1024)
def _tokens(text):
    return frozenset(t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(t) > 1)
