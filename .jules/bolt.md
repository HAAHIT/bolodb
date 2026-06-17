## 2025-06-17 - React.memo with inline transformations
**Learning:** `ResultTable` in `static/index.html` is wrapped in `React.memo()`, but in `StarterCard`, the `rows` prop is passed as `window.rowsToArrays(s.columns||[], s.rows||[])`. This creates a new array reference on every render, defeating the memoization.
**Action:** When using `React.memo()`, ensure props are referentially stable, especially arrays and objects. Memoize inline transformations (like `useMemo(() => rowsToArrays(...), [...])`) so the memoized component can successfully skip re-renders.
