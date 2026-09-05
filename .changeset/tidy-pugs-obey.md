---
'@dnd-kit/dom': patch
'@dnd-kit/react': patch
'@dnd-kit/vue': patch
'@dnd-kit/solid': patch
'@dnd-kit/svelte': patch
---

Respect `transition: null` in the React, Vue, Solid and Svelte sortable bindings. The bindings previously merged `defaultSortableTransition` before constructing or updating the core `Sortable`, which replaced an explicit `null` with the default transition, so sortable items kept animating. They now use the new `resolveSortableTransition` helper exported from `@dnd-kit/dom/sortable`, which preserves `null` while still merging partial transitions with the defaults.
