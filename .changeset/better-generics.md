---
'@dnd-kit/dom': patch
'@dnd-kit/react': patch
---

Improved TypeScript generics for better type safety and flexibility

- Enhanced `DragDropManager` to accept generic type parameters with proper constraints, allowing for more flexible type usage while maintaining type safety
- Updated `DragDropProvider` to support custom generic types for draggable and droppable entities
- Modified React hooks (`useDragDropManager`, `useDragDropMonitor`, `useDragOperation`) to properly infer and return the correct generic types
- Changed from concrete `Draggable` and `Droppable` types to generic parameters constrained by `Data` type
