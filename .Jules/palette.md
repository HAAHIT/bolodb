## 2024-06-12 - Reusable Copy-to-Clipboard UX Pattern
**Learning:** Implementing visual feedback (like a "Copied!" state with an icon) on clipboard actions increases user confidence and provides immediate acknowledgement, reducing friction.
**Action:** Always include a visual success state (e.g. timeout-reverted button text, color changes) and an `aria-live="polite"` attribute for screen reader announcements when implementing copy-to-clipboard functionality.
