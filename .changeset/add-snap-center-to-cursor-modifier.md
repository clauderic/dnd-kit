---
'@dnd-kit/dom': patch
---

Added `SnapToPointer` modifier that offsets the drag transform so a specified anchor point of the dragged element snaps to the cursor position. The `anchor` option accepts an `{x, y}` object with values between `0` and `1` representing the relative position within the draggable element. Defaults to `{x: 0.5, y: 0.5}` (center).
