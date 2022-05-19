---
'@dnd-kit/core': major
---

The keyboard sensor now keeps track of the initial coordinates of the collision rect to provide a translate delta when move events are dispatched.

This is a breaking change that may affect consumers that had created custom keyboard coordinate getters.

Previously the keyboard sensor would measure the initial rect of the active node and store its top and left properties as its initial coordinates it would then compare all subsequent move coordinates to calculate the delta.

This approach suffered from the following issues:

- It didn't respect the measuring configuration defined on the `<DndContext>` for the draggable node
- Some consumers re-render the active node after dragging begins, which would lead to stale measurements
- An error had to be thrown if there was no active node during the activation phase of the keyboard sensor. This shouldn't be a concern of the keyboard sensor.
- The `currentCoordinates` passed to the coordinate getter were often stale and not an accurate representation of the current position of the collision rect, which can be affected by a number of different variables, such as modifiers.
