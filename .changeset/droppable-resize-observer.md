---
'@dnd-kit/core': major
'@dnd-kit/sortable': minor
---

Droppable containers now observe the node they are attached to via `setNodeRef` using `ResizeObserver` while dragging.

This behaviour can be configured using the newly introduced `resizeObserverConfig` property.

```ts
interface ResizeObserverConfig {
  /** Whether the ResizeObserver should be disabled entirely */
  disabled?: boolean;
  /** Resize events may affect the layout and position of other droppable containers.
   * Specify an array of `UniqueIdentifier` of droppable containers that should also be re-measured
   * when this droppable container resizes. Specifying an empty array re-measures all droppable containers.
   */
  updateMeasurementsFor?: UniqueIdentifier[];
  /** Represents the debounce timeout between when resize events are observed and when elements are re-measured */
  timeout?: number;
}
```

By default, only the current droppable is re-measured when a resize event is observed. However, this may not be suitable for all use-cases. When an element resizes, it can affect the layout and position of other elements, such that it may be necessary to re-measure other droppable nodes in response to that single resize event. The `recomputeIds` property can be used to specify which droppable `id`s should be re-measured in response to resize events being observed.

For example, the `useSortable` preset re-computes the measurements of all sortable elements after the element that resizes, so long as they are within the same `SortableContext` as the element that resizes, since it's highly likely that their layout will also shift.

Specifying an empty array for `recomputeIds` forces all droppable containers to be re-measured.

For consumers that were relyings on the internals of `DndContext` using `useDndContext()`, the `willRecomputeLayouts` property has been renamed to `measuringScheduled`, and the `recomputeLayouts` method has been renamed to `measureDroppableContainers`, and now optionally accepts an array of droppable `UniqueIdentifier` that should be scheduled to be re-measured.
