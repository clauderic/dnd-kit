---
'@dnd-kit/helpers': patch
'@dnd-kit/dom': patch
---

Fix the `move` and `swap` helpers to support computed sortable IDs and optimistic sorting reconciliation for grouped records.

When the ID-based lookup fails (e.g. when using computed IDs like `id={\`sortable-${item.id}\`}` that don't match data items), the helpers now fall back to sortable index properties (`initialIndex`, `index`, `group`, `initialGroup`) to determine the correct positions. Additionally, grouped records now support optimistic sorting reconciliation—when `source.id === target.id` after optimistic sorting, the helpers use the sortable indices to determine the intended move.

Added `initialIndex`, `group`, and `initialGroup` getters to `SortableDraggable`, and `index` and `group` getters to `SortableDroppable`, so these properties are accessible from the operation's `source` and `target` in drag events.
