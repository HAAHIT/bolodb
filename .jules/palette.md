## 2024-07-05 - Avoid DOM-removing hover events for keyboard a11y
**Learning:** Using JS `onmouseenter`/`onmouseleave` to conditionally render actions (like delete buttons in a list) removes the element from the DOM entirely when not hovered, making it completely invisible to keyboard navigation.
**Action:** Render utility actions persistently in the DOM and use CSS techniques like `.group` on the parent and `opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100` on the button to visually reveal it on hover/focus while keeping it tab-accessible.
