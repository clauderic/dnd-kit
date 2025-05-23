---
'@dnd-kit/react': patch
---

**<DragOverlay>**: Added `disabled` prop to temporarily disable `<DragOverlay>` without unmounting it. The `disabled` prop accepts either a `boolean` or function that receives the `source` as input and returns a `boolean`, which can be useful to disable the `<DragOverlay>` based on the `type` or `data` of the `source`.
