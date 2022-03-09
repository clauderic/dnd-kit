---
"@dnd-kit/sortable": patch
---

Fixed an issue that affected `SortableContext` performance. The `sortedRects` property of the `SortableContext` provider were being recomputed whenever coordinates changed rather than only when the order of the items changed.
