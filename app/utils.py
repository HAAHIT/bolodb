import re
from functools import lru_cache

# Caching this regex-based tokenization prevents redundant parsing of schema elements
# (tables, columns) and retrieved verified questions during the schema-linking phase.
# The return type MUST be immutable (frozenset) to prevent callers from accidentally
# mutating the cached objects when they use in-place updates (like `q_tokens |= _tokens(c)`).
@lru_cache(maxsize=1024)
def _tokens(text):
    return frozenset(t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(t) > 1)
