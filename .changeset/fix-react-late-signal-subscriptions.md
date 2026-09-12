---
'@dnd-kit/react': patch
'@dnd-kit/vue': patch
'@dnd-kit/solid': patch
'@dnd-kit/svelte': patch
---

Fix missing state updates when draggable, droppable, or sortable properties are first read on a later render in React, Vue, Solid, and Svelte. Retain signal subscriptions across view updates and prevent update loops for getters that return new objects.
