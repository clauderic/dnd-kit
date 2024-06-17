---
'@dnd-kit/react': patch
---

Fixed a bug where `useDraggable`, `useDroppable` and `useSortable` would not un-register from the old manager and re-register themselves with the new manager when its reference changes.
