---
"@dnd-kit/sortable": patch
---

Ensure that consumer defined data passed to `useSortable` is passed down to both `useDraggable` and `useDroppable`. 

The `data` object that is passed to `useDraggable` and `useDroppable` within `useSortable` also contains the `sortable` property, which holds a reference to the index of the item, along with the `containerId` and the `items` of its parent `SortableContext`.
