---
'@dnd-kit/sortable': patch
---

Fixed a bug with the default layout animation function where it could return `true` initially even if the list had not been sorted yet. Now checking the `wasDragging` property to ensure no layout animation occurs if `wasDragging` is false.
