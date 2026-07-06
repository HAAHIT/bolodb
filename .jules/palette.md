## 2026-06-25 - Playwright character encoding with standalone React
**Learning:** When mocking an HTML document to test specific React components (like `ResultTable` in `index.html`) using Playwright, if the mock lacks a proper `<meta charset="UTF-8"/>` tag, unicode characters like the "✓" checkmark may render as garbled mojibake (e.g. "âœ“") in the resulting screenshots, obscuring the UX validation.
**Action:** Always include `<meta charset="UTF-8"/>` within the `<head>` of mocked HTML documents constructed for Playwright verification to ensure correct visual rendering of unicode text and icons.

## 2026-07-06 - Keyboard accessibility of hover-revealed actions
**Learning:** Conditionally rendering hover-revealed utility actions (like delete buttons) using JS mouse events (`onmouseenter`/`onmouseleave`) completely removes them from the DOM, making them impossible to reach via keyboard navigation, breaking accessibility for a key interaction.
**Action:** Always render utility actions persistently in the DOM and rely on CSS-based visibility management (e.g., `opacity-0 group-hover:opacity-100 group-focus-within:opacity-100`) to ensure they remain keyboard focusable and accessible while maintaining visual tidiness.
