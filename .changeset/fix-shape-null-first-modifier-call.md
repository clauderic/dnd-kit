---
"@dnd-kit/dom": patch
---

Fixed `operation.shape` being `null` on the first `modifier.apply()` call. The `Feedback` plugin now measures the feedback element's shape and sets it on the drag operation *before* computing the initial transform, so modifiers that depend on `shape.initial` (e.g. snap-to-cursor) receive the correct bounding rect on the first frame. This restores the v1 behaviour where `draggingNodeRect` was always available in modifier functions.
