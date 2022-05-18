---
'@dnd-kit/core': minor
---

By default, @dnd-kit now attempts to compensate for layout shifts that happen right after the `onDragStart` event is dispatched by scrolling the first scrollable ancestor of the active draggable node.

The `autoScroll` prop of `<DndContext>` now optionally accepts a `layoutShiftCompensation` property to control this new behavior:

```diff
interface AutoScrollOptions {
  acceleration?: number;
  activator?: AutoScrollActivator;
  canScroll?: CanScroll;
  enabled?: boolean;
  interval?: number;
+ layoutShiftCompensation?: boolean | {x: boolean, y: boolean};
  order?: TraversalOrder;
  threshold?: {
    x: number;
    y: number;
  };
}
```

To enable/disable layout shift scroll compensation for a single scroll axis, pass in the following autoscroll configuration to `<DndContext>`:

```ts
<DndContext
  autoScroll={{layoutShiftCompensation: {x: false, y: true}}}
>
```

To completely disable layout shift scroll compensation, pass in the following autoscroll configuration to `<DndContext>`:

```ts
<DndContext
  autoScroll={{layoutShiftCompensation: false}}
>
```
