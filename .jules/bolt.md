## 2025-02-27 - Cache Poisoning with mutable returns
**Learning:** When using `@functools.lru_cache` to memoize functions that return collections (like `set` or `list`), modifying the returned collection in the caller can inadvertently mutate the cached value (cache poisoning).
**Action:** Always return an immutable type (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections.

## 2025-02-27 - Synchronous Operations Blocking FastAPI Event Loop
**Learning:** In async FastAPI endpoints, synchronous database operations (like `db.connect`, `db.get_schema`, and `db.schema_as_text` when using `create_engine` without an async driver) block the main event loop, causing severe performance bottlenecks when handling concurrent requests.
**Action:** Always wrap synchronous operations inside async functions with `fastapi.concurrency.run_in_threadpool` or `asyncio.to_thread`.
