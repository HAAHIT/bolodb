## 2024-06-09 - Added ARIA Label to Settings Close Button
**Learning:** Found that the app uses a standalone React build within a monolithic `static/index.html` file, where many purely icon-based buttons (like `<Ico.x/>`) lack `aria-label`s. This is a common pattern in single-file prototypes that hurts accessibility.
**Action:** When working on similar monolithic UI structures, explicitly search for `<button>` elements that only wrap `<Ico... />` components and systematically add `aria-label`s to them to improve screen reader accessibility.
