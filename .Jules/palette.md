## 2024-05-19 - Adding visual feedback and aria-live to copy-to-clipboard interactions
**Learning:** Copy interactions without immediate visual success states create friction and uncertainty. Additionally, screen reader users need an `aria-live` announcement when a copy action succeeds to know their clipboard was updated.
**Action:** When implementing copy-to-clipboard functionality, always include a visual success state (e.g., timeout-reverted button text, color changes) and an `aria-live="polite"` attribute for screen reader announcements to provide immediate acknowledgement.
