---
'@dnd-kit/abstract': patch
'@dnd-kit/react': patch
'@dnd-kit/dom': patch
'@dnd-kit/state': patch
---

- `draggable`: Fixed a bug where the `element` was not properly being set on initialization
- `feedback`: Fixed a bug with optimistic re-ordering.
- `scroller`: Fixed a bug with auto-scrolling when target is position fixed
- `deepEqual`: Handle comparing `Set` instances
