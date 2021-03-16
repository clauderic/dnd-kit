---
"@dnd-kit/core": minor
---

Added `dragCancel` prop to DndContext. The `dragCancel` prop can be used to cancel a drag operation on drop. The prop accepts a function that returns a boolean, or a promise returning a boolean once resolved. Return `false` to cancel the drop.
