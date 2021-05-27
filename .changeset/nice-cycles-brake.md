---
'@dnd-kit/modifiers': patch
'@dnd-kit/sortable': patch
---

Use @dnd-kit/core as peerDependency in other dnd-kit packages.

Earlier @dnd-kit/core was used as dependency inside other dnd-kit packages.
It broke dnd-kit sorting in yarn 2 based projects - there were 2 instances of @dnd-kit/core, providing different DndContexts.
Because of 2 different DndContexts SortableItems had no listeners, that's why sorting did not work.

Now @dnd-kit/core is used as peerDependency inside other dnd-kit packages.
There is only one @dnd-kit/core instance in the App and only one DndContext - everything works well.
