---
"@dnd-kit/core": major
"@dnd-kit/sortable": major
"@dnd-kit/utilities": minor
"@dnd-kit/modifiers": minor
---

Major internal refactor of measuring and collision detection. 

### Summary of changes
Previously, all collision detection algorithms were relative to the top and left points of the document. While this approach worked in most situations, it broke down in a number of different use-cases, such as fixed position droppable containers and trying to drag between containers that had different scroll positions.

This new approach changes the frame of comparison to be relative to the viewport. This is a major breaking change, and will need to be released under a new major version bump.

### Breaking changes:

- By default, `@dnd-kit` now ignores only the transforms applied to the draggable / droppable node itself, but considers all the transforms applied to its ancestors. This should provide the right balance of flexibility for most consumers.
  - Transforms applied to the droppable and draggable nodes are ignored by default, because the recommended approach for moving items on the screen is to use the transform property, which can interfere with the calculation of collisions.
  - Consumers can choose an alternate approach that does consider transforms for specific use-cases if needed by configuring the measuring prop of <DndContext>. Refer to the <Switch> example.
- Reduced the number of concepts related to measuring from `ViewRect`, `LayoutRect` to just a single concept of `ClientRect`.
  - The `ClientRect` interface no longer holds the `offsetTop` and `offsetLeft` properties. For most use-cases, you can replace `offsetTop` with `top` and `offsetLeft` with `left`.
  - Replaced the following exports from the `@dnd-kit/core` package with `getClientRect`: 
    - `getBoundingClientRect`
    - `getViewRect`
    - `getLayoutRect`
    - `getViewportLayoutRect`
- Removed `translatedRect` from the `SensorContext` interface. Replace usage with `collisionRect`.
- Removed `activeNodeClientRect` on the `DndContext` interface. Replace with `activeNodeRect`.
