---
"@dnd-kit/sortable": minor
---

Improvements to better support swappable strategies:

- Now exporting an `arraySwap` helper to be used instead of `arrayMove` `onDragEnd`.
- Added the `getNewIndex` prop on `useSortable`. By default, `useSortable` assumes that items will be moved to their new index using `arrayMove()`, but this isn't always the case, especially when using strategies like `rectSwappingStrategy`. For those scenarios, consumers can now define custom logic that should be used to get the new index for an item on drop, for example, by computing the new order of items using `arraySwap`. 
