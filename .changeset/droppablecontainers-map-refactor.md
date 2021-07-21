---
'@dnd-kit/core': major
'@dnd-kit/sortable': patch
---

Refactored `DroppableContainers` type from `Record<UniqueIdentifier, DroppableContainer` to a custom instance that extends the [`Map` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and adds a few other methods such as `toArray()`, `getEnabled()` and `getNodeFor(id)`.

A unique `key` property was also added to the `DraggableNode` and `DroppableContainer` interfaces. This prevents potential race conditions in the mount and cleanup effects of `useDraggable` and `useDroppable`. It's possible for the clean-up effect to run after another React component using `useDraggable` or `useDroppable` mounts, which causes the newly mounted element to accidentally be un-registered.
