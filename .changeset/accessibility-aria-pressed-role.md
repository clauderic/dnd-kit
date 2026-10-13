---
'@dnd-kit/dom': patch
---

The `Accessibility` plugin no longer sets `aria-pressed` on draggable activators whose role isn't `button`, such as `role="tab"`, where the attribute isn't allowed.
