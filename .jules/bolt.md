## 2025-02-27 - Cache Poisoning with mutable returns
**Learning:** When using `@functools.lru_cache` to memoize functions that return collections (like `set` or `list`), modifying the returned collection in the caller can inadvertently mutate the cached value (cache poisoning).
**Action:** Always return an immutable type (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections.
## 2025-02-27 - Blocking non-essential I/O
**Learning:** Awaiting `run_in_threadpool` blocks the response cycle. Using this for non-essential I/O (like logging or saving query history to MongoDB) unnecessarily delays returning the API response to the user.
**Action:** Use FastAPI's `BackgroundTasks` (`background_tasks.add_task(func, ...)`) instead of `run_in_threadpool` for fire-and-forget background operations like logging to reduce endpoint latency.
