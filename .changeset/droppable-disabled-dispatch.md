---
'@dnd-kit/core': minor
---

Fixed an issue with `useDroppable` hook needlessly dispatching `SetDroppableDisabled` actions even if the `disabled` property had not changed since registering the droppable.
