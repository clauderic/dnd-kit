---
'@dnd-kit/svelte': minor
---

Remove `OptimisticSortingPlugin` from Svelte adapter defaults to prevent conflicts with Svelte 5's `{#each}` reconciliation. The plugin physically reorders DOM elements during drag, which breaks Svelte's internal effect linked list, causing incorrect mutations or an infinite loop when state is updated.

Visual sorting during drag is now achieved by calling `move()` in an `onDragOver` handler, which routes all DOM reordering through Svelte's own reconciler. Update your sortable components to use the snapshot pattern:

```svelte
let snapshot = [];

function onDragStart() { snapshot = items.slice(); }
function onDragOver(event) { items = move(items, event); }
function onDragEnd(event) { if (event.canceled) items = snapshot; }
```
