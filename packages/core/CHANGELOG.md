# @dnd-kit/core

## 2.1.2

### Patch Changes

- [`2833337`](https://github.com/clauderic/dnd-kit/commit/2833337043719853902c3989dfcd5b55ae9ddc73) [#186](https://github.com/clauderic/dnd-kit/pull/186) Thanks [@clauderic](https://github.com/clauderic)! - Simplify `useAnnouncement` hook to only return a single `announcement` rather than `entries`. Similarly, the `LiveRegion` component now only accepts a single `announcement` rather than `entries.

  - The current strategy used in the useAnnouncement hook is needlessly complex. It's not actually necessary to render multiple announcements at once within the LiveRegion component. It's sufficient to render a single announcement at a time. It's also un-necessary to clean up the announcements after they have been announced, especially now that the role="status" attribute has been added to LiveRegion, keeping the last announcement rendered means users can refer to the last status.

- Updated dependencies [[`c24bdb3`](https://github.com/clauderic/dnd-kit/commit/c24bdb3723f1e3e4c474439f837a19c6d48059fb), [`2833337`](https://github.com/clauderic/dnd-kit/commit/2833337043719853902c3989dfcd5b55ae9ddc73)]:
  - @dnd-kit/accessibility@2.0.0

## 2.1.1

### Patch Changes

- [`cc0a6ff`](https://github.com/clauderic/dnd-kit/commit/cc0a6ff310582ee4c02dd8320d86bf1c2d281d30) [#177](https://github.com/clauderic/dnd-kit/pull/177) Thanks [@FinestV](https://github.com/FinestV)! - fix calculations for top and left auto scroll speed

## 2.1.0

### Minor Changes

- [`bdb1aa2`](https://github.com/clauderic/dnd-kit/commit/bdb1aa2b62f855a4ccd048d452d4dd93529af563) [#171](https://github.com/clauderic/dnd-kit/pull/171) Thanks [@mitchheddles](https://github.com/mitchheddles)! - Added more flexibility for the `distance` and `tolerance` activation constraints. Consumers can still provide a `number` to calculate the distance or tolerance constraints, but can now also pass in an object that adheres to the `DistanceMeasurement` interface instead. This change allows consumers to specify which axis the activation distance or tolerance should be measured against, either `x`, `y` or both.

  ```
  type DistanceMeasurement =
    | number
    | {x: number}
    | {y: number}
    | {x: number, y: number}

  interface DistanceConstraint {
    distance: DistanceMeasurement;
  }

  interface DelayConstraint {
    delay: number;
    tolerance: DistanceMeasurement;
  }
  ```

  **Example usage:**

  For example, when building a list that can only be sorted vertically when using the `restrictToVerticalAxis` modifier, a consumer can now configure sensors to only measure distance against the `y` axis when using the `MouseSensor`, and afford more tolerance on the `y` axis than the `x` axis for the `TouchSensor`:

  ```
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: { y: 10 },
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: { y: 15, x: 5 },
      },
    }),
  );
  ```

  This also fixes a bug with the way the distance is calculated when passing a number to the `distance` or `tolerance` options. Previously, the sum of the distance on both the `x` and `y` axis was being calculated rather than the hypothenuse.

## 2.0.2

### Patch Changes

- [`f038174`](https://github.com/clauderic/dnd-kit/commit/f038174c2096ae287ffa6a5fab9dda09a0f76016) [#166](https://github.com/clauderic/dnd-kit/pull/166) Thanks [@shayc](https://github.com/shayc)! - AutoScrollActivator enum was being exported as a type rather than a value.

- [`7422e25`](https://github.com/clauderic/dnd-kit/commit/7422e25c069fa2a28d56a57d1e7bc1f761efb971) [#165](https://github.com/clauderic/dnd-kit/pull/165) Thanks [@clauderic](https://github.com/clauderic)! - Fix regression with autoscroll disabling by sensors

## 2.0.1

### Patch Changes

- [`a847a80`](https://github.com/clauderic/dnd-kit/commit/a847a800400a392ad4653199b6705dd687703d01) [#160](https://github.com/clauderic/dnd-kit/pull/160) Thanks [@clauderic](https://github.com/clauderic)! - Allow consumers to define drag source opacity in drop animation by setting the `dragSourceOpacity` option to a number on the `dropAnimation` prop of `DragOverlay`.

- [`ea9d878`](https://github.com/clauderic/dnd-kit/commit/ea9d878e7c1bd8b46482ee4b82a39f744db027b9) [#164](https://github.com/clauderic/dnd-kit/pull/164) Thanks [@clauderic](https://github.com/clauderic)! - Export AutoScrollActivator enum for consumers.

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

## 1.2.0

### Minor Changes

- [`79f6088`](https://github.com/clauderic/dnd-kit/commit/79f6088dab2d4e7443743f85b329a25a023ecd87) [#144](https://github.com/clauderic/dnd-kit/pull/144) Thanks [@clauderic](https://github.com/clauderic)! - Allow consumers to determine whether to animate layout changes and when to measure nodes. Consumers can now use the `animateLayoutChanges` prop of `useSortable` to determine whether layout animations should occur. Consumers can now also decide when to measure layouts, and at what frequency using the `layoutMeasuring` prop of `DndContext`. By default, `DndContext` will measure layouts just-in-time after sorting has begun. Consumers can override this behaviour to either only measure before dragging begins (on mount and after dragging), or always (on mount, before dragging, after dragging). Pairing the `layoutMeasuring` prop on `DndContext` and the `animateLayoutChanges` prop of `useSortable` opens up a number of new possibilities for consumers, such as animating insertion and removal of items in a sortable list.

- [`a76cd5a`](https://github.com/clauderic/dnd-kit/commit/a76cd5abcc0b17eae20d4a6256d95b47f2e9d050) [#136](https://github.com/clauderic/dnd-kit/pull/136) Thanks [@clauderic](https://github.com/clauderic)! - Added `onActivation` option to sensors. Delegated the responsibility of calling `event.preventDefault()` on activation to consumers, as consumers have the most context to decide whether it is appropriate or not to prevent the default browser behaviour on activation. Consumers of the sensors can prevent the default behaviour on activation using the `onActivation` option. Here is an example using the Pointer sensor: `useSensor(PointerSensor, {onActivation: (event) => event.preventDefault()})`

### Patch Changes

- [`adb7bd5`](https://github.com/clauderic/dnd-kit/commit/adb7bd58d7d95db5e450a1518541d3d71704529d) [#151](https://github.com/clauderic/dnd-kit/pull/151) Thanks [@clauderic](https://github.com/clauderic)! - `DragOverlay` now attempts to perform drop animation even if `transform.x` and `transform.y` are both zero.

## 1.1.0

### Minor Changes

- [`ac674e8`](https://github.com/clauderic/dnd-kit/commit/ac674e8e9f9e041af96034675a075cb9aa357927) [#135](https://github.com/clauderic/dnd-kit/pull/135) Thanks [@ranbena](https://github.com/ranbena)! - Added `dragCancel` prop to DndContext. The `dragCancel` prop can be used to cancel a drag operation on drop. The prop accepts a function that returns a boolean, or a promise returning a boolean once resolved. Return `false` to cancel the drop.

- [`208f68e`](https://github.com/clauderic/dnd-kit/commit/208f68e251c1b81a624f810f40e7c8d4f36f102d) [#111](https://github.com/clauderic/dnd-kit/pull/111) Thanks [@ranbena](https://github.com/ranbena)! - Keyboard sensor now cancels dragging on window resize

## 1.0.2

### Patch Changes

- [`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba) [#56](https://github.com/clauderic/dnd-kit/pull/56) Thanks [@clauderic](https://github.com/clauderic)! - Add MIT license to package.json and distributed files

- [`594a24e`](https://github.com/clauderic/dnd-kit/commit/594a24e61e2fb559bceab8b50a07ceeeadf86417) [#106](https://github.com/clauderic/dnd-kit/pull/106) Thanks [@ranbena](https://github.com/ranbena)! - Replace `animation.finished` with `animation.onfinish` for DragOverlay drop animation as the latter has much better support across browsers.

- [`fd25eaf`](https://github.com/clauderic/dnd-kit/commit/fd25eaf7c114f73918bf83801890d970c9b56d18) [#68](https://github.com/clauderic/dnd-kit/pull/68) Thanks [@Pustelto](https://github.com/Pustelto)! - Wrap attributes returned from useDraggable hook in useMemo to allow pure component optimization

- Updated dependencies [[`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba)]:
  - @dnd-kit/accessibility@1.0.2
  - @dnd-kit/utilities@1.0.2

## 1.0.1

### Patch Changes

- [`5194696`](https://github.com/clauderic/dnd-kit/commit/5194696b4b91f26379cd3e6c11b2d66c92d32c5b) [#51](https://github.com/clauderic/dnd-kit/pull/51) Thanks [@clauderic](https://github.com/clauderic)! - Fix issue with reducer initial state variable causing collisions due to variable references all pointing to the original initial state variable.

- [`310bbd6`](https://github.com/clauderic/dnd-kit/commit/310bbd6370e85f8fb16cad149e6254600a5beb3a) [#37](https://github.com/clauderic/dnd-kit/pull/37) Thanks [@nickpresta](https://github.com/nickpresta)! - Fix typo in package.json repository URL

- Updated dependencies [[`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48), [`310bbd6`](https://github.com/clauderic/dnd-kit/commit/310bbd6370e85f8fb16cad149e6254600a5beb3a)]:
  - @dnd-kit/utilities@1.0.1
  - @dnd-kit/accessibility@1.0.1

## 1.0.0

### Major Changes

- [`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63) Thanks [@clauderic](https://github.com/clauderic)! - Initial public release.

### Patch Changes

- Updated dependencies [[`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63)]:
  - @dnd-kit/accessibility@1.0.0
  - @dnd-kit/utilities@1.0.0

## 0.1.1

### Patch Changes

- [`2bb3065`](https://github.com/clauderic/dnd-kit/commit/2bb3065abeb83ca346c080715ee8bbe093459125) Thanks [@clauderic](https://github.com/clauderic)! - No longer setting `pointer-events` to `none` for DragOverlay component as it interferes with custom cursors.

- [`bf04b2b`](https://github.com/clauderic/dnd-kit/commit/bf04b2b7736dad0be66a2c9136bf18ec0417df62) Thanks [@clauderic](https://github.com/clauderic)! - Allow nullish values to be passed to `useSensors` for conditional sensors.

## 0.1.0

### Minor Changes

- [`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e) [#30](https://github.com/clauderic/dnd-kit/pull/30) - Initial beta release, authored by [@clauderic](https://github.com/clauderic).

### Patch Changes

- Updated dependencies [[`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e)]:
  - @dnd-kit/accessibility@0.1.0
  - @dnd-kit/utilities@0.1.0
