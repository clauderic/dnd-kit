---
'@dnd-kit/dom': minor
'@dnd-kit/react': minor
'@dnd-kit/vue': minor
'@dnd-kit/svelte': minor
'@dnd-kit/solid': minor
---

Add `isSortableOperation` type guard and export `SortableDraggable`/`SortableDroppable` types.

`isSortableOperation(operation)` narrows a `DragOperationSnapshot` so that `source` is typed as `SortableDraggable` and `target` as `SortableDroppable`, providing typed access to sortable-specific properties like `index`, `initialIndex`, `group`, and `initialGroup`.

Re-exported from all framework packages (`@dnd-kit/react/sortable`, `@dnd-kit/vue/sortable`, `@dnd-kit/svelte/sortable`, `@dnd-kit/solid/sortable`).
