import re
import functools

# ⚡ Bolt: Memoize tokenization for performance. We return frozenset because lru_cache requires an immutable return type to be safely cached without callers accidentally mutating it.
@functools.lru_cache(maxsize=2048)
def _tokens(text):
    return frozenset(t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(t) > 1)
