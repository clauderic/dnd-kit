---
"@dnd-kit/core": major
---

The `layoutMeasuring` prop of `DndContext` has been renamed to `measuring`. 

The options that could previously be passed to the `layoutMeasuring` prop now need to be passed as:
```diff
<DndContext
- layoutMeasuring={options}
+ measuring={{
+   droppable: options
+ }}
```

The `LayoutMeasuring` type has been renamed to `MeasuringConfiguration`. The `LayoutMeasuringStrategy` and `LayoutMeasuringFrequency` enums have also been renamed to `MeasuringStrategy` and `MeasuringFrequency`.

This refactor allows consumers to configure how to measure both droppable and draggable nodes. By default, `@dnd-kit` ignores transforms when measuring draggable nodes. This beahviour can now be configured:

```tsx
import {
  DndContext,
  getBoundingClientRect,
  MeasuringConfiguration,
} from '@dnd-kit/core';

const measuringConfig: MeasuringConfiguration = {
  draggable: {
    measure: getBoundingClientRect,
  },
};

function App() {
  return <DndContext measuring={measuringConfig} />
}
```
