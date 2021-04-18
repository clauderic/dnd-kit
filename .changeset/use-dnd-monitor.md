---
"@dnd-kit/accessibility": patch
"@dnd-kit/core": major
---

Introduced the `useDndMonitor` hook. The `useDndMonitor` hook can be used within components wrapped in a `DndContext` provider to monitor the different drag and drop events that happen for that `DndContext`.

Example usage:

```tsx
import {DndContext, useDndMonitor} from '@dnd-kit/core';

function App() {
  return (
    <DndContext>
      <Component />
    </DndContext>
  );
}

function Component() {
  useDndMonitor({
    onDragStart(event) {},
    onDragMove(event) {},
    onDragOver(event) {},
    onDragEnd(event) {},
    onDragCancel(event) {},
  })
}
```
