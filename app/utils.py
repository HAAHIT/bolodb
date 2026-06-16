import re
from functools import lru_cache

@lru_cache(maxsize=2048)
def _tokens(text):
    # Performance: Memoize tokenization since schema column/table names are repeatedly
    # tokenized across queries. Return a frozenset to prevent cache poisoning.
    return frozenset(t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(t) > 1)
