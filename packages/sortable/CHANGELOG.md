# @dnd-kit/sortable

## 2.0.1

### Patch Changes

- [`92afb0f`](https://github.com/clauderic/dnd-kit/commit/92afb0f6bcb9dd91f7e487ef44c43c8d28241f6f) [#168](https://github.com/clauderic/dnd-kit/pull/168) Thanks [@clauderic](https://github.com/clauderic)! - Make sure that the `wasSorting` argument of the `animateLayoutChanges` prop of `useSortable` always receives the latest value.

- Updated dependencies [[`bdb1aa2`](https://github.com/clauderic/dnd-kit/commit/bdb1aa2b62f855a4ccd048d452d4dd93529af563)]:
  - @dnd-kit/core@2.1.0

## 2.0.0

### Major Changes

- [`8583825`](https://github.com/clauderic/dnd-kit/commit/8583825380bc4d7c36e076be30bb5ca3fd20a26b) [#140](https://github.com/clauderic/dnd-kit/pull/140) Thanks [@clauderic](https://github.com/clauderic)! - Auto-scrolling defaults have been updated, which should generally lead to improved user experience for most consumers.

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

### Patch Changes

- Updated dependencies [[`8583825`](https://github.com/clauderic/dnd-kit/commit/8583825380bc4d7c36e076be30bb5ca3fd20a26b)]:
  - @dnd-kit/core@2.0.0

## 1.1.0

### Minor Changes

- [`79f6088`](https://github.com/clauderic/dnd-kit/commit/79f6088dab2d4e7443743f85b329a25a023ecd87) [#144](https://github.com/clauderic/dnd-kit/pull/144) Thanks [@clauderic](https://github.com/clauderic)! - Allow consumers to determine whether to animate layout changes and when to measure nodes. Consumers can now use the `animateLayoutChanges` prop of `useSortable` to determine whether layout animations should occur. Consumers can now also decide when to measure layouts, and at what frequency using the `layoutMeasuring` prop of `DndContext`. By default, `DndContext` will measure layouts just-in-time after sorting has begun. Consumers can override this behaviour to either only measure before dragging begins (on mount and after dragging), or always (on mount, before dragging, after dragging). Pairing the `layoutMeasuring` prop on `DndContext` and the `animateLayoutChanges` prop of `useSortable` opens up a number of new possibilities for consumers, such as animating insertion and removal of items in a sortable list.

### Patch Changes

- Updated dependencies [[`adb7bd5`](https://github.com/clauderic/dnd-kit/commit/adb7bd58d7d95db5e450a1518541d3d71704529d), [`79f6088`](https://github.com/clauderic/dnd-kit/commit/79f6088dab2d4e7443743f85b329a25a023ecd87), [`a76cd5a`](https://github.com/clauderic/dnd-kit/commit/a76cd5abcc0b17eae20d4a6256d95b47f2e9d050)]:
  - @dnd-kit/core@1.2.0

## 1.0.2

### Patch Changes

- [`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba) [#56](https://github.com/clauderic/dnd-kit/pull/56) Thanks [@clauderic](https://github.com/clauderic)! - Add MIT license to package.json and distributed files

- Updated dependencies [[`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba), [`594a24e`](https://github.com/clauderic/dnd-kit/commit/594a24e61e2fb559bceab8b50a07ceeeadf86417), [`fd25eaf`](https://github.com/clauderic/dnd-kit/commit/fd25eaf7c114f73918bf83801890d970c9b56d18)]:
  - @dnd-kit/core@1.0.2
  - @dnd-kit/utilities@1.0.2

## 1.0.1

### Patch Changes

- [`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48) [#52](https://github.com/clauderic/dnd-kit/pull/52) Thanks [@clauderic](https://github.com/clauderic)! - Add repository entry to package.json files

- [`78a7b67`](https://github.com/clauderic/dnd-kit/commit/78a7b672e856c911e7cfdd4ec8f6e4d0e7c36531) Thanks [@clauderic](https://github.com/clauderic)! - Fix an issue with the sortable keyboard coordinate getter not excluding disabled droppables.

- Updated dependencies [[`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48), [`5194696`](https://github.com/clauderic/dnd-kit/commit/5194696b4b91f26379cd3e6c11b2d66c92d32c5b), [`310bbd6`](https://github.com/clauderic/dnd-kit/commit/310bbd6370e85f8fb16cad149e6254600a5beb3a)]:
  - @dnd-kit/utilities@1.0.1
  - @dnd-kit/core@1.0.1

## 1.0.0

### Major Changes

- [`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63) Thanks [@clauderic](https://github.com/clauderic)! - Initial public release.

### Patch Changes

- Updated dependencies [[`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63)]:
  - @dnd-kit/core@1.0.0
  - @dnd-kit/utilities@1.0.0

## 0.1.0

### Minor Changes

- [`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e) [#30](https://github.com/clauderic/dnd-kit/pull/30) - Initial beta release, authored by [@clauderic](https://github.com/clauderic).

### Patch Changes

- Updated dependencies [[`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e)]:
  - @dnd-kit/core@0.1.0
  - @dnd-kit/utilities@0.1.0
