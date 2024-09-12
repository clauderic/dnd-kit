---
'@dnd-kit/dom': patch
---

Allow `Sortable` to have a distinct `element` from the underlying `source` and `target` elements. This can be useful if you want the collision detection to operate on a subset of the sortable element, but the entirety of the element to move when its index changes.
