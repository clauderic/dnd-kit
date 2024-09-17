---
'@dnd-kit/abstract': patch
---

Fixed a bug where the `accept` function of `Droppable` was never invoked if the `draggable` did not have a `type` set.
