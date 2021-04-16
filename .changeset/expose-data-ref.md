---
'@dnd-kit/core': minor
'@dnd-kit/sortable': minor
---

The `data` argument for `useDraggable` and `useDroppable` is now exposed in event handlers and on the `active` and `over` objects.

**Example usage:**

```tsx
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/core';

function Draggable() {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'draggable',
    data: {
      type: 'type1',
    },
  });

  /* ... */
}

function Droppable() {
  const {setNodeRef} = useDroppable({
    id: 'droppable',
    data: {
      accepts: ['type1', 'type2'],
    },
  });

  /* ... */
}

function App() {
  return (
    <DndContext
      onDragEnd={({active, over}) => {
        if (over?.data.current.accepts.includes(active.data.current.type)) {
          // do stuff
        }
      }}
    />
  );
}
```
