## 2024-05-19 - Tokenization Memoization
**Learning:** Frequent tokenization of repeating strings (like table/column names in `link_relevant_tables`) during schema analysis was causing redundant computations. The `utils._tokens` function was unmemoized.
**Action:** When memoizing utility functions that return collections, always use `frozenset` instead of `set` to prevent unintended cache poisoning by callers that might use mutable operators (like `|=`).
