---
'@dnd-kit/dom': patch
'@dnd-kit/vue': patch
---

Fix sortable type narrowing so `isSortable(event.operation.source)` narrows to a sortable draggable with access to `initialIndex`, and re-export the drag event type aliases from `@dnd-kit/vue`.
