## 2025-02-27 - Cache Poisoning with mutable returns
**Learning:** When using `@functools.lru_cache` to memoize functions that return collections (like `set` or `list`), modifying the returned collection in the caller can inadvertently mutate the cached value (cache poisoning).
**Action:** Always return an immutable type (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections.

## 2024-07-03 - FastAPI Fire-and-forget Anti-pattern
**Learning:** Found a pattern where non-essential I/O (like persisting query history to MongoDB) used `await run_in_threadpool(...)`. Even though it offloads synchronous work to a thread, `await` still blocks the API response cycle until the DB write completes, unnecessarily increasing endpoint latency.
**Action:** Replace `await run_in_threadpool` with `FastAPI.BackgroundTasks` for fire-and-forget database writes. Always remember that exceptions must be handled inside the background task function itself.
