---
'@dnd-kit/dom': patch
---

**OptimisticSortingPlugin**: Fixed a bug where using `queueMicrotask` in the `dragover` event of to check if `event.defaultPrevented()` was called by consumers was causing the order that we capture to be stale in the event that the consumer updates the order of sortable items before the micortask runs, which can happen in React for consumers using `useOptimistic` to update state optimistically.
