---
"@dnd-kit/core": minor
---

The collision rect is now completely based on the position of the `DragOverlay` when it is used. Previously, only the `width` and `height` properties of the `DragOverlay` were used for the collision rect, while the `top`, `left`, `bottom` and `right` properties were derived from the active node rect. This new approach is more aligned with developers would expect, but could cause issues for consumers that were relying on the previous (incorrect) behavior.
