---
'@dnd-kit/accessibility': patch
---

The ARIA live region element used for screen reader announcements is now positioned using `position: fixed` instead of `position: absolute`. As of `@dnd-kit/core^6.0.0`, the live region element is no longer portaled by default into the `document.body`. This change was introduced in order to fix issues with portaled live regions. However, this change can introduce visual regressions when using absolutely positioned elements, since the live region element is constrained to the stacking and position context of its closest positioned ancestor. Using fixed position ensures the element does not introduce visual regressions.
