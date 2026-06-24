## 2024-06-24 - Visual and Accessible Feedback for Clipboard Actions
**Learning:** Copy-to-clipboard functionality without visual acknowledgment leaves users uncertain if their action succeeded, causing friction. Additionally, screen reader users miss the success state without an accessible live region.
**Action:** Always include a visual success state (e.g., timeout-reverted button text, color changes) and an `aria-live="polite"` attribute for screen reader announcements to provide immediate acknowledgement and reduce friction.
