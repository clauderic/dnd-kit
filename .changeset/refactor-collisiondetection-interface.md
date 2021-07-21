---
"@dnd-kit/core": major
"@dnd-kit/sortable": patch
---

Breaking change: The `CollisionDetection` interface has been refactored. It now receives an object that contains the `active` draggable node, along with the `collisionRect` and an array of `droppableContainers`.

If you've built custom collision detection algorithms, you'll need to update them. Refer to [this PR](https://github.com/clauderic/dnd-kit/pull/350) for examples of how to refactor collision detection functions to the new `CollisionDetection` interface. 

The `sortableKeyboardCoordinates` method has also been updated since it relies on the `closestCorners` collision detection algorithm. If you were using collision detection strategies in a custom `sortableKeyboardCoordinates` method, you'll need to update those as well.
