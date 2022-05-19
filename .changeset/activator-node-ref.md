---
'@dnd-kit/core': minor
'@dnd-kit/sortable': minor
---

#### Introducing activator node refs

Introducing the concept of activator node refs for `useDraggable` and `useSortable`. This allows @dnd-kit to handle common use-cases such as restoring focus on the activator node after dragging via the keyboard or only allowing the activator node to instantiate the keyboard sensor.

Consumers of `useDraggable` and `useSortable` may now optionally set the activator node ref on the element that receives listeners:

```diff
import {useDraggable} from '@dnd-kit/core';

function Draggable(props) {
  const {
    listeners,
    setNodeRef,
+   setActivatorNodeRef,
  } = useDraggable({id: props.id});

  return (
    <div ref={setNodeRef}>
      Draggable element
      <button
        {...listeners}
+       ref={setActivatorNodeRef}
      >
        :: Drag Handle
      </button>
    </div>
  )
}
```

It's common for the activator element (the element that receives the sensor listeners) to differ from the draggable node. When this happens, @dnd-kit has no reliable way to get a reference to the activator node after dragging ends, as the original `event.target` that instantiated the sensor may no longer be mounted in the DOM or associated with the draggable node that was previously active.

#### Automatically restoring focus

Focus management is now automatically handled by @dnd-kit. When the activator event is a Keyboard event, @dnd-kit will now attempt to automatically restore focus back to the first focusable node of the activator node or draggable node.

If no activator node is specified via the `setActivatorNodeRef` setter function of `useDraggble` and `useSortable`, @dnd-kit will automatically restore focus on the first focusable node of the draggable node set via the `setNodeRef` setter function of `useDraggable` and `useSortable`.

If you were previously managing focus manually and would like to opt-out of automatic focus management, use the newly introduced `restoreFocus` property of the `accessibility` prop of `<DndContext>`:

```diff
<DndContext
  accessibility={{
+   restoreFocus: false
  }}
```
