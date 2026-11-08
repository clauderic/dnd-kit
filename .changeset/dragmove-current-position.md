---
'@dnd-kit/abstract': patch
---

Fixed `dragmove` listeners seeing the position from before the move. `operation.position.current` (and `previous`) in the event now reflect the position the move produces, so they no longer lag one move behind. This was most visible with the keyboard sensor, where each key press moves by a large step. Preventing the move still leaves the drag position unchanged.
