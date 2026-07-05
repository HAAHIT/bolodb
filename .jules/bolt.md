## 2025-02-27 - Cache Poisoning with mutable returns
**Learning:** When using `@functools.lru_cache` to memoize functions that return collections (like `set` or `list`), modifying the returned collection in the caller can inadvertently mutate the cached value (cache poisoning).
**Action:** Always return an immutable type (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections.

## 2023-10-27 - BackgroundTasks vs run_in_threadpool
**Learning:** Awaiting `fastapi.concurrency.run_in_threadpool` still blocks the API response cycle since the coroutine waits for the thread to finish. For fire-and-forget I/O operations (like logging to a database), this increases endpoint latency unnecessarily.
**Action:** Use `FastAPI.BackgroundTasks` (`background_tasks.add_task(...)`) instead of awaiting `run_in_threadpool` for non-essential, fire-and-forget I/O operations. Ensure exception handling is implemented within the offloaded task function itself.
