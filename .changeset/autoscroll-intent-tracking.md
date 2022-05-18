---
'@dnd-kit/core': minor
---

The auto scroller now keeps track of the drag direction to infer scroll intent. By default, auto-scrolling will now be disabled for a given direction if dragging in that direction hasn't occurred yet. This prevents accidental auto-scrolling when picking up a draggable item that is near the scroll boundary threshold.
