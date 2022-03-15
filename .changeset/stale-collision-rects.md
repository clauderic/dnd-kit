---
'@dnd-kit/core': minor
---

Fixed an issue with collision detection using stale rects. The `droppableRects` property has been added to the `CollisionDetection` interface.

All built-in collision detection algorithms have been updated to get the rect for a given droppable container from `droppableRects` rather than from the `rect.current` ref:

```diff
- const rect = droppableContainers.get(id).rect.current;
+ const rect = droppableRects.get(id);
```

The `rect.current` ref stored on DroppableContainers can be stale if measuring is scheduled but has not completed yet. Collision detection algorithms should use the `droppableRects` map instead to get the latest, most up-to-date measurement of a droppable container in order to avoid computing collisions against stale rects.

This is not a breaking change. Hoever, if you've forked any of the built-in collision detection algorithms or you've authored custom ones, we highly recommend you update your use-cases to avoid possibly computing collisions against stale rects.
