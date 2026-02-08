---
'@dnd-kit/dom': patch
---

Respect `prefers-reduced-motion` media query across all animations. When the user prefers reduced motion, the following animations are disabled:
- Keyboard drag move transitions (250ms translate)
- Drop animation (250ms slide-back)
- Sortable item swap transitions (250ms position shift)
