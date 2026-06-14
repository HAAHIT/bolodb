## 2026-06-14 - Copy-to-Clipboard Feedback
**Learning:** Copy-to-clipboard interactions without explicit state changes leave users uncertain if the action succeeded. Screen readers also miss the event without an explicit notification.
**Action:** Implement explicit visual success states (color changes, text updates) and use `aria-live="polite"` on buttons to ensure robust feedback across all user contexts.
