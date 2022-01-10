---
'@dnd-kit/core': patch
---

Only use `ResizeObserver` in `useDroppable` and `<DragOverlay>` if it is available in the execution environment.
