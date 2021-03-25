---
'@dnd-kit/core': major
'@dnd-kit/sortable': major
---

Auto-scrolling defaults have been updated, which should generally lead to improved user experience for most consumers.

The auto-scroller now bases its calculations based on the position of the pointer rather than the edges of the draggable element's rect by default. This change is aligned with how the native HTML 5 Drag & Drop auto-scrolling behaves.

This behaviour can be customized using the `activator` option of the `autoScroll` prop:

```tsx
import {AutoScrollActivator, DndContext} from '@dnd-kit/core';

<DndContext autoScroll={{activator: AutoScrollActivator.DraggableRect}} />;
```

The auto-scroller now also looks at scrollable ancestors in order of appearance in the DOM tree, meaning it will first attempt to scroll the window, and narrow its focus down rather than the old behaviour of looking at scrollable ancestors in order of closeness to the draggable element in the DOM tree (reversed tree order).

This generally leads to an improved user experience, but can be customized by passing a configuration object to the `autoScroll` prop that sets the `order` option to `TraversalOrder.ReversedTreeOrder` instead of the new default value of `TraversalOrder.TreeOrder`:

```tsx
import {DndContext, TraversalOrder} from '@dnd-kit/core';

<DndContext autoScroll={{order: TraversalOrder.ReversedTreeOrder}} />;
```

The autoscrolling `thresholds`, `acceleration` and `interval` can now also be customized using the `autoScroll` prop:

```tsx
import {DndContext} from '@dnd-kit/core';

<DndContext
  autoScroll={{
    thresholds: {
      // Left and right 10% of the scroll container activate scrolling
      x: 0.1,
      // Top and bottom 25% of the scroll container activate scrolling
      y: 0.25,
    },
    // Accelerate slower than the default value (10)
    acceleration: 5,
    // Auto-scroll every 10ms instead of the default value of 5ms
    interval: 10,
  }}
/>;
```

Finally, consumers can now conditionally opt out of scrolling certain scrollable ancestors using the `canScroll` option of the `autoScroll` prop:

```tsx
import {DndContext} from '@dnd-kit/core';

<DndContext
  autoScroll={{
    canScroll(element) {
      if (element === document.scrollingElement) {
        return false;
      }

      return true;
    },
  }}
/>;
```
