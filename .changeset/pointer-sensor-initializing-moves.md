---
'@dnd-kit/dom': patch
---

Record pointer moves received while a drag operation is initializing so the drag position catches up when the operation starts, instead of staying at the pointerdown position until the next pointer move.
