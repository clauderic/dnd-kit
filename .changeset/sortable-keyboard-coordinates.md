---
'@dnd-kit/sortable': major
---

Changes to the default `sortableKeyboardCoordinates` KeyboardSensor coordinate getter.

#### Better handling of variable sizes

The default `sortableKeyboardCoordinates` function now has better handling of lists that have items of variable sizes. We recommend that consumers re-order lists `onDragOver` instead of `onDragEnd` when sorting lists of variable sizes via the keyboard for optimal compatibility.

#### Better handling of overlapping droppables

The default `sortableKeyboardCoordinates` function that is exported from the `@dnd-kit/sortable` package has been updated to better handle cases where the collision rectangle is overlapping droppable rectangles. For example, for `down` arrow key, the default function had logic that would only consider collisions against droppables that were below the `bottom` edge of the collision rect. This was problematic when the collision rect was overlapping droppable rects, because it meant that it's bottom edge was below the top edge of the droppable, and that resulted in that droppable being skipped.

```diff
- collisionRect.bottom > droppableRect.top
+ collisionRect.top > droppableRect.top
```

This change should be backwards compatible for most consumers, but may introduce regressions in some use-cases, especially for consumers that may have copied the multiple containers examples. There is now a custom sortable keyboard coordinate getter [optimized for multiple containers that you can refer to](https://github.com/clauderic/dnd-kit/tree/master/stories/2%20-%20Presets/Sortable/multipleContainersKeyboardCoordinates.ts).
