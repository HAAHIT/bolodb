## 2025-02-27 - Cache Poisoning with mutable returns
**Learning:** When using `@functools.lru_cache` to memoize functions that return collections (like `set` or `list`), modifying the returned collection in the caller can inadvertently mutate the cached value (cache poisoning).
**Action:** Always return an immutable type (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections.
## 2025-02-27 - Blocking Event Loop with Awaited Threadpool for I/O Logging
**Learning:** Awaiting `run_in_threadpool` for non-essential fire-and-forget I/O operations (like logging to a database) blocks the API response cycle and increases endpoint latency, reducing performance. In FastAPI, `BackgroundTasks` should be utilized for such detached work instead. However, since `BackgroundTasks.add_task(...)` only schedules the task, any exception handling must be inside the task function itself (e.g., in a separate helper).
**Action:** When handling fire-and-forget I/O in FastAPI endpoints, always use `BackgroundTasks` instead of awaiting `run_in_threadpool`. Ensure necessary `try...except` handling is defined within the offloaded function itself.
