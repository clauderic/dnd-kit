---
'@dnd-kit/react': patch
---

Fixed `useDraggable` reassigning `draggable.sensors` on every render when `sensors` was passed as an inline array. The `sensors` prop is now compared with `deepEqual` (matching the existing behavior of `modifiers`, `plugins`, and `DragDropProvider`), preventing unnecessary mutations to the plugin registry that could disrupt in-progress sensor activation.
