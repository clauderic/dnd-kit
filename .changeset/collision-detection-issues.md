---
"@dnd-kit/core": major
---

React updates in non-synthetic event handlers are now batched to reduce re-renders and prepare for React 18.

Also fixed issues with collision detection:
- Defer measurement of droppable node rects until second render after dragging.
- Use DragOverlay's width and height in collision rect (if it is used)
