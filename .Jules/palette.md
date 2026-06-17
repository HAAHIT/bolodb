## 2024-06-17 - Visual Success States for Copy Actions
**Learning:** Copy-to-clipboard interactions without clear visual and audible feedback (via aria-live) create uncertainty for users. The lack of a success state leads to repeated clicks and cognitive friction.
**Action:** Always include a visual success state (e.g., color change, text change to "Copied!") and an `aria-live="polite"` attribute for copy interactions, with a timeout to revert the state.
