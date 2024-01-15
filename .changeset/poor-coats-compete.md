---
'@dnd-kit/core': minor
---

Add `initial` and `delta` to `pointerCoordinates` in `collisionDetection`

This allows custom `collisionDetection` algorithms to consider where the event
started or by how much it moved, allowing, for instance, for different
collisions when dragging left than when dragging right.

No change in usage required.
