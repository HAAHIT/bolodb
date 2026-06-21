## 2024-05-24 - Preserving React.memo() with data transformations
**Learning:** Even when using `React.memo` for components like `ResultTable`, passing inline computations or array transformations (like `s.columns || []` or mapping operations) as props breaks the memoization because those expressions generate new object references on every render.
**Action:** When transforming data for a memoized child component, always wrap the transformation in `React.useMemo()` to ensure referential stability and preserve the performance benefits of `React.memo()`.
