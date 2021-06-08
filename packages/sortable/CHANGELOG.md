# @dnd-kit/sortable

## 4.0.0

### Patch Changes

- Updated dependencies [[`d39ab11`](https://github.com/clauderic/dnd-kit/commit/d39ab1112f9be78d467b2dfe488a7ea931d93767)]:
  - @dnd-kit/core@3.1.0

## 3.1.0

### Minor Changes

- [`68960c4`](https://github.com/clauderic/dnd-kit/commit/68960c490f50962b47a57663ee0625d7704173ec) [#295](https://github.com/clauderic/dnd-kit/pull/295) Thanks [@akhmadullin](https://github.com/akhmadullin)! - `@dnd-kit/core` is now a `peerDependency` rather than a `dependency` for other `@dnd-kit` packages that depend on it, such as `@dnd-kit/sortable` and `@dnd-kit/modifiers`. This is done to avoid issues with multiple versions of `@dnd-kit/core` being installed by some package managers such as Yarn 2.

### Patch Changes

- Updated dependencies [[`ae398de`](https://github.com/clauderic/dnd-kit/commit/ae398de012aee28f5e3bec10b438153d00f65630), [`8b938ce`](https://github.com/clauderic/dnd-kit/commit/8b938ceb158c67e9fdc4616351d1a3291ac614c3)]:
  - @dnd-kit/core@3.0.4

## 3.0.1

### Patch Changes

- [`a178857`](https://github.com/clauderic/dnd-kit/commit/a1788579ee12d1c1af8244bdf6a17f3f5ba388a1) [#214](https://github.com/clauderic/dnd-kit/pull/214) Thanks [@clauderic](https://github.com/clauderic)! - Ensure that consumer defined data passed to `useSortable` is passed down to both `useDraggable` and `useDroppable`.

  The `data` object that is passed to `useDraggable` and `useDroppable` within `useSortable` also contains the `sortable` property, which holds a reference to the index of the item, along with the `containerId` and the `items` of its parent `SortableContext`.

## 3.0.0

### Major Changes

- [`a9d92cf`](https://github.com/clauderic/dnd-kit/commit/a9d92cf1fa35dd957e6c5915a13dfd2af134c103) [#174](https://github.com/clauderic/dnd-kit/pull/174) Thanks [@clauderic](https://github.com/clauderic)! - Distributed assets now only target modern browsers. [Browserlist](https://github.com/browserslist/browserslist) config:

  ```
  defaults
  last 2 version
  not IE 11
  not dead
  ```

  If you need to support older browsers, include the appropriate polyfills in your project's build process.

### Minor Changes

- [`b7355d1`](https://github.com/clauderic/dnd-kit/commit/b7355d19d9e15bb1972627bb622c2487ddec82ad) [#207](https://github.com/clauderic/dnd-kit/pull/207) Thanks [@clauderic](https://github.com/clauderic)! - The `data` argument for `useDraggable` and `useDroppable` is now exposed in event handlers and on the `active` and `over` objects.

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

### Patch Changes

- [`fb2db94`](https://github.com/clauderic/dnd-kit/commit/fb2db941d00d1f876a62751c6ac9d79143876598) [#212](https://github.com/clauderic/dnd-kit/pull/212) Thanks [@clauderic](https://github.com/clauderic)! - Allow consumers of `SortableContext` to provide items of shape `{id: string}[]` or `string[]`

- Updated dependencies [[`b7355d1`](https://github.com/clauderic/dnd-kit/commit/b7355d19d9e15bb1972627bb622c2487ddec82ad), [`a9d92cf`](https://github.com/clauderic/dnd-kit/commit/a9d92cf1fa35dd957e6c5915a13dfd2af134c103), [`b406cb9`](https://github.com/clauderic/dnd-kit/commit/b406cb9251beef8677d05c45ec42bab7581a86dc)]:
  - @dnd-kit/core@3.0.0
  - @dnd-kit/utilities@2.0.0

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
