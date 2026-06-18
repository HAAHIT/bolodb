## 2024-06-18 - Missing Memoization Breaks React.memo() Performance

**Learning:** When using `React.memo()` on components that take arrays or objects as props (like `<ResultTable />`), passing inline transformations (e.g., `rows={window.rowsToArrays(s.columns||[], s.rows||[])}`) defeats the purpose of the memoization. The inline function creates a new array reference on every render, causing the memoized component to forcefully re-render regardless of whether the actual data changed. This can become a major bottleneck for heavy components like data grids.

**Action:** Always wrap dynamically generated objects or arrays in `React.useMemo()` before passing them down as props to components optimized with `React.memo()`. Ensure referential stability for memoized components.
