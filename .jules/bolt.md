## 2024-06-23 - Memoizing collection returns with lru_cache

**Learning:** When using `functools.lru_cache` to memoize functions that return collections (like sets or lists), if you return a mutable collection, callers might accidentally mutate the returned object, which alters the cached value itself (cache poisoning).
**Action:** Always ensure the return type is immutable (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections to prevent cache poisoning via unintended mutations by callers.
