---
'@dnd-kit/dom': patch
---

Fix the `KeyboardSensor` replaying key presses that a modifier absorbed. When a modifier such as `RestrictToElement` holds the draggable at an edge, extra arrow presses past the edge no longer accumulate, so pressing the opposite arrow moves the draggable right away. With `SnapModifier`, presses towards the right and bottom now move by one grid step each time.
