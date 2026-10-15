---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
---

Fix stale `initialIndex` and `initialGroup` on `Sortable` in `onBeforeDragStart` after the item has moved. Add an `initializationPending` getter to the drag operation status.
