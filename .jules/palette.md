## 2026-06-25 - Playwright character encoding with standalone React
**Learning:** When mocking an HTML document to test specific React components (like `ResultTable` in `index.html`) using Playwright, if the mock lacks a proper `<meta charset="UTF-8"/>` tag, unicode characters like the "✓" checkmark may render as garbled mojibake (e.g. "âœ“") in the resulting screenshots, obscuring the UX validation.
**Action:** Always include `<meta charset="UTF-8"/>` within the `<head>` of mocked HTML documents constructed for Playwright verification to ensure correct visual rendering of unicode text and icons.

## 2024-07-09 - Label elements in forms
**Learning:** Found a pattern of using `<div>` elements styled to look like labels above form inputs. This breaks screen reader associations and prevents the native behavior where clicking the label text focuses the input, adding unnecessary friction.
**Action:** Always replace `<div>` wrappers for field names with proper `<label for="id">` tags and ensure inputs have matching `id` attributes to maintain accessibility and interaction affordances.
