---
'@dnd-kit/core': major
'@dnd-kit/sortable': major
---

The `UniqueIdentifier` type has been updated to now accept either `string` or `number` identifiers. As a result, the `id` property of `useDraggable`, `useDroppable` and `useSortable` and the `items` prop of `<SortableContext>` now all accept either `string` or `number` identifiers.

#### Migration steps

For consumers that are using TypeScript, import the `UniqueIdentifier` type to have strongly typed local state:

```diff
+ import type {UniqueIdentifier} from '@dnd-kit/core';

function MyComponent() {
-  const [items, setItems] = useState(['A', 'B', 'C']);
+  const [items, setItems] = useState<UniqueIdentifier>(['A', 'B', 'C']);
}
```

Alternatively, consumers can cast or convert the `id` property to a `string` when reading the `id` property of interfaces such as `Active`, `Over`, `DroppableContainer` and `DraggableNode`.

The `draggableNodes` object has also been converted to a map. Consumers that were reading from the `draggableNodes` property that is available on the public context of `<DndContext>` should follow these migration steps:

```diff
- draggableNodes[someId];
+ draggableNodes.get(someId);
```
