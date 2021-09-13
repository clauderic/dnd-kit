---
'@dnd-kit/core': minor
---

Sensors may now specify a static `setup` method that will be invoked when `<DndContext>` mounts. The setup method may optionally also return a teardown function that will be invoked when the `<DndContext>` associated with that sensor unmounts.
