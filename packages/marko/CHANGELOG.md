# @dnd-kit/marko

## 0.0.1

### Initial Release

First release of the Marko v6 adapter for `@dnd-kit/dom`.

#### Tags

- `<drag-drop-provider>` — root context provider, creates and manages `DragDropManager`
- `<create-draggable>` — draggable entity with `isDragging`, `setElement`, `setHandle`
- `<create-droppable>` — droppable target zone with `isDropTarget`, `setElement`
- `<create-sortable>` — sortable entity (draggable + droppable) with full sort support

#### Internal tags

- `<let-global>` — reactive `$global` bridge with per-key subscription system
- `<create-deep-signal>` — Preact signals → Marko reactivity bridge via per-property `effect()` subscriptions

#### Runtime utilities

- `createRenderer()` — renderer bridge implementing the double-`queueMicrotask` pattern to correctly sequence Marko's scheduler with dnd-kit's state machine
- `withoutOptimisticSorting` — filter to remove `OptimisticSortingPlugin` from the default plugin list (required for correct `<for>` reconciler behavior)
