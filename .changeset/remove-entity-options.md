---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
'@dnd-kit/react': patch
---

Removed `options` and `options.register` from `Entity` base class. Passing an `undefined` manager when instantiating `Draggable` and `Droppable` now has the same effect.
