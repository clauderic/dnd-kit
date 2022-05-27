---
'@dnd-kit/core': patch
---

Fixed a regression with scrollable ancestors detection.

The scrollable ancestors should be determined by the active node or the over node exclusively. The `draggingNode` variable shouldn't be used to detect scrollable ancestors since it can be the drag overlay node, and the drag overlay node doesn't have any scrollable ancestors because it is a fixed position element.
