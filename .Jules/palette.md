## 2024-10-24 - Visual and Auditory Feedback for Clipboard Actions
**Learning:** Copy-to-clipboard functionality without a visual success state causes friction as users are unsure if it worked. Furthermore, dynamic text changes on actions like copy must be announced via `aria-live="polite"` so screen reader users get the same immediate acknowledgement.
**Action:** Always include a timeout-reverted visual success state (button text, color change) and `aria-live` attribute for copy-to-clipboard buttons across components.
