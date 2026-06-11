## 2025-10-24 - Pre-compiled Regex and Token Memoization
**Learning:** Frequent tokenisation of queries and database schemas happens in tight loops (`KnowledgeBase.retrieve_similar` and `schema_link.link_relevant_tables`). `re.findall` on uncompiled string patterns adds overhead, and the same strings (table names, column names) are tokenised thousands of times redundantly.
**Action:** Use `re.compile` at module level and `functools.lru_cache` on `_tokens` in `app/utils.py` to memoize the token sets, eliminating repeated parsing and massively boosting similarity check speed.
