---
'@dnd-kit/sortable': minor
---

`SortableContext` now always requests measuring of droppable containers when its `items` prop changes, regardless of whether or not dragging is in progress. Measuring will occur if the measuring configuration allows for it.
