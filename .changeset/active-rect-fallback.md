---
'@dnd-kit/core': patch
---

Fallback to initial rect measured for the active draggable node if it unmounts during initialization (after `onDragStart` is dispatched).
