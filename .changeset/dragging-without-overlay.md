---
'@dnd-kit/core': minor
---

Improved `useDraggable` usage without `<DragOverlay>`:

- The active draggable now scrolls with the page even if there is no `<DragOverlay>` used.
- Fixed issues when re-ordering the active draggable node in the DOM while dragging.
