---
"@dnd-kit/modifiers": minor
---

Update modifiers to use `draggingNodeRect` instead of `activeNodeRect`. Modifiers should be based on the rect of the node being dragged, whether it is the draggable node or drag overlay node.
