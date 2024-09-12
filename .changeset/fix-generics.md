---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
---

Make sure the generic for `DragDropManager` is passed through to `Entity` so that the `manager` reference on classes extending `Entity` is strongly typed.
