---
'@dnd-kit/core': patch
---

Fixed a bug in the `KeyboardSensor` where it would not move the draggable on the horizontal axis if it could fully scroll to the new vertical coordinates, and would not move the draggable on the vertical axis if it could fully scroll to the new horizontal coordinates.
