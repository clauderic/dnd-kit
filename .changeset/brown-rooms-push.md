---
'@dnd-kit/abstract': patch
---

Fix `dragstart` events so `operation.target` includes the initial droppable target while preserving `dragstart` before `dragover` ordering and queued `setDropTarget()` completion semantics.
