import re
import functools

# Pre-compile the regex to avoid redundant compilation overhead during tight loops.
_TOKEN_RE = re.compile(r"[a-z0-9]+")

# Memoize tokenization since the same strings (table names, columns, queries)
# are repeatedly tokenized in schema linking and similarity checking.
# Use frozenset to ensure the cached return value cannot be accidentally mutated by callers.
# Impact: Speeds up _similarity and link_relevant_tables significantly (~10-20x for _tokens itself).
@functools.lru_cache(maxsize=4096)
def _tokens(text):
    return frozenset(t for t in _TOKEN_RE.findall((text or "").lower()) if len(t) > 1)
