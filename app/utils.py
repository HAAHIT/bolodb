import re
from functools import lru_cache

# Performance optimization: pre-compile regex to avoid compiling it on every call
_TOKEN_RE = re.compile(r"[a-z0-9]+")

# Performance optimization: memoize tokenization since the same terms and schemas
# are repeatedly tokenized during schema linking and knowledge retrieval.
# Return frozenset to prevent cache poisoning.
@lru_cache(maxsize=1024)
def _tokens(text):
    return frozenset(t for t in _TOKEN_RE.findall((text or "").lower()) if len(t) > 1)
