---
'@dnd-kit/core': minor
---

The `useDndMonitor()` hook has been refactored to be synchronously invoked at the same time as the events dispatched by `<DndContext>` (such as `onDragStart`, `onDragOver`, `onDragEnd`).

The new refactor uses the subscribe/notify pattern and no longer causes re-renders in consuming components of `useDndMonitor()` when events are dispatched.
