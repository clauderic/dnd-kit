---
"@dnd-kit/core": major
"@dnd-kit/sortable": patch
---

Refactored `DroppableContainers` type from `Record<UniqueIdentifier, DroppableContainer` to a custom instance that extends the [`Map` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and adds a few other methods such as `toArray()`, `getEnabled()` and `getNodeFor(id)` 
