---
'@dnd-kit/sortable': patch
---

The `wasDragging` property of `animateLayoutChanges` now remains true for longer than a single re-render. Before this change, it was possible for the component where `useSortable` is used to re-render before @dnd-kit is ready to perform the layout animation, causing the animation to be skipped entirely.
