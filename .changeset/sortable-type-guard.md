---
'@dnd-kit/sortable': patch
---

The `hasSortableData` type-guard that is exported by @dnd-kit/sortable has been updated to also accept the `Active` and `Over` interfaces so it can be used in events such as `onDragStart`, `onDragOver`, and `onDragEnd`.
