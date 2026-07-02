## 2025-02-27 - Cache Poisoning with mutable returns
**Learning:** When using `@functools.lru_cache` to memoize functions that return collections (like `set` or `list`), modifying the returned collection in the caller can inadvertently mutate the cached value (cache poisoning).
**Action:** Always return an immutable type (e.g., `frozenset` instead of `set`, or `tuple` instead of `list`) when memoizing functions that return collections.
## 2025-02-27 - Fast API Background Tasks Exception Handling
**Learning:** When using `FastAPI.BackgroundTasks` (`background_tasks.add_task(...)`), the task is only scheduled, not executed synchronously. Wrapping `add_task` in a `try...except` block will not catch exceptions thrown during task execution.
**Action:** Ensure exception handling logic (`try...except`) is included inside the target function itself or inside a wrapper function that is passed to `add_task`.
