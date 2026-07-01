---
'@dnd-kit/react': patch
---

Defer `useSignal` re-renders to a microtask so a signal that changes while React is mid-commit no longer schedules a synchronous update from within a React lifecycle method. Reading `useDragOperation` in a component that renders during a drag previously threw `useInsertionEffect must not schedule updates` (and could crash reconciliation with `NotFoundError: Node.removeChild`) because dnd-kit resets the drag operation from a layout effect at drag end. Mirrors the existing guard in `useDeepSignal`.
