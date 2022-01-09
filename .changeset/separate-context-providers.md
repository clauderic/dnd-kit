---
'@dnd-kit/core': major
'@dnd-kit/sortable': major
---

Separated context into public and internal context providers. Certain properties that used to be available on the public `DndContextDescriptor` interface have been moved to the internal context provider and are no longer exposed to consumers:

```ts
interface DndContextDescriptor {
-  dispatch: React.Dispatch<Actions>;
-  activators: SyntheticListeners;
-  ariaDescribedById: {
-    draggable: UniqueIdentifier;
-  };
}
```

Having two distinct context providers will allow to keep certain internals such as `dispatch` hidden from consumers.

It also serves as an optimization until context selectors are implemented in React, properties that change often, such as the droppable containers and droppable rects, the transform value and array of collisions should be stored on a different context provider to limit un-necessary re-renders in `useDraggable`, `useDroppable` and `useSortable`.

The `<InternalContext.Provider>` is also reset to its default values within `<DragOverlay>`. This paves the way towards being able to seamlessly use components that use hooks such as `useDraggable` and `useDroppable` as children of `<DragOverlay>` without causing interference or namespace collisions.

Consumers can still make calls to `useDndContext()` to get the `active` or `over` properties if they wish to re-render the component rendered within `DragOverlay` in response to user interaction, since those use the `PublicContext`
