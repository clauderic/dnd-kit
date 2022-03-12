---
'@dnd-kit/core': patch
---

- Fixed React warning in development when unmounting a component that uses the `useDraggable` hook by ensuring that the `ResizeObserver` is disconnected in a cleanup effect.
