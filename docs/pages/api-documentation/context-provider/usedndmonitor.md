# useDndMonitor

The `useDndMonitor` hook can be used within components wrapped in a `DndContext` provider to monitor the different drag and drop events that happen for that `DndContext`.

```jsx
import {DndContext, useDndMonitor} from '@dnd-kit/core';

function App() {
  return (
    <DndContext>
      <Component />
    </DndContext>
  );
}

function Component() {
  // Monitor drag and drop events that happen on the parent `DndContext` provider
  useDndMonitor({
    onDragStart(event) {},
    onDragMove(event) {},
    onDragOver(event) {},
    onDragEnd(event) {},
    onDragCancel(event) {},
  });
}
```



