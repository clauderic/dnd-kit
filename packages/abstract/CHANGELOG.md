# @dnd-kit/abstract

## 0.1.13

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.13
  - @dnd-kit/state@0.1.13

## 0.1.12

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.12
  - @dnd-kit/state@0.1.12

## 0.1.11

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.11
  - @dnd-kit/state@0.1.11

## 0.1.10

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.10
  - @dnd-kit/state@0.1.10

## 0.1.9

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.9
  - @dnd-kit/state@0.1.9

## 0.1.8

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.8
  - @dnd-kit/state@0.1.8

## 0.1.7

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.7
  - @dnd-kit/state@0.1.7

## 0.1.6

### Patch Changes

- [#1671](https://github.com/clauderic/dnd-kit/pull/1671) [`7ceb799`](https://github.com/clauderic/dnd-kit/commit/7ceb799c7d214bc8223ec845357a0040c28ae40e) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix shape snapshotting in DragOperation

  - Ensure shape is properly snapshotted when creating operation state snapshot

- Updated dependencies [[`299389b`](https://github.com/clauderic/dnd-kit/commit/299389befcc747fe8d79231ba32f73afae88615e)]:
  - @dnd-kit/state@0.1.6
  - @dnd-kit/geometry@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.5
  - @dnd-kit/state@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.4
  - @dnd-kit/state@0.1.4

## 0.1.3

### Patch Changes

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`6c9a9ea`](https://github.com/clauderic/dnd-kit/commit/6c9a9ea060095884c90c72cd5d6b73820467ec29) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent race conditions in `dragOperation` when `actions.stop()` is invoked before `actions.start()` has completed.

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`1bef872`](https://github.com/clauderic/dnd-kit/commit/1bef8722d515079f998dc0608084e1d853e74d3a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improve drag operation control by:

  - Introducing `AbortController` for better operation lifecycle management
  - Remove `requestAnimationFram()` from `start()` action
  - Replacing boolean returns with proper abort control
  - Ensure proper cleanup of drag operations
  - Improving status handling and initialization checks
  - Making feedback plugin respect operation initialization state

- Updated dependencies [[`8f91d91`](https://github.com/clauderic/dnd-kit/commit/8f91d9112608d2077c3b6c8fc939aa052606148c), [`2522836`](https://github.com/clauderic/dnd-kit/commit/2522836fdb80520913ea35d94c6558bf7784afc9), [`9a0edf6`](https://github.com/clauderic/dnd-kit/commit/9a0edf64cbde1bd761f3650e043b6612e61a5fab), [`a9db4c7`](https://github.com/clauderic/dnd-kit/commit/a9db4c73467d9eda9f95fe5b582948c9fc735f57)]:
  - @dnd-kit/state@0.1.3
  - @dnd-kit/geometry@0.1.3

## 0.1.2

### Patch Changes

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`4682570`](https://github.com/clauderic/dnd-kit/commit/4682570a6b80868af0e51b1bbbf902430117df43) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix handling of aborted drag operations across sensors. The `start` method now returns a boolean to indicate whether the operation was aborted, allowing sensors to properly clean up when a drag operation is prevented. This affects the Keyboard and Pointer sensors, ensuring they properly handle cases where `beforeDragStart` events are prevented.

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`f8d69b0`](https://github.com/clauderic/dnd-kit/commit/f8d69b01f4cf53fc368ef1fca9188c313192928d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow `actions.start()` to optionally receive a `source` as input.

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`d04e9a2`](https://github.com/clauderic/dnd-kit/commit/d04e9a2879fb00f092c3f8280c8081a48eebf193) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent starting a new drag operation while another one is active by adding a status check in the drag operation manager. This change throws an error if an attempt is made to start a drag operation while another one is in progress.

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor the drag operation system to improve code organization and maintainability:

  - Split `dragOperation.ts` into multiple focused files:
    - `operation.ts` - Core drag operation logic
    - `status.ts` - Status management
    - `actions.ts` - Drag actions
  - Update imports and exports to reflect new file structure
  - Improve type definitions and exports

- Updated dependencies [[`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a)]:
  - @dnd-kit/state@0.1.2
  - @dnd-kit/geometry@0.1.2

## 0.1.1

### Patch Changes

- [#1656](https://github.com/clauderic/dnd-kit/pull/1656) [`f13cbc9`](https://github.com/clauderic/dnd-kit/commit/f13cbc978229844770d3c8aa03135e4352ee2532) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add a new `initialization-pending` status to the drag operation lifecycle. This status is set after a dragOperation is initiated but before the `beforedragstart` event fires, which allows consumers to prevent a drag operation from being initialized. This provides better control over the drag operation lifecycle and enables cancellation of drag operations before they are initialized.

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.1
  - @dnd-kit/state@0.1.1

## 0.1.0

### Minor Changes

- [#1650](https://github.com/clauderic/dnd-kit/pull/1650) [`00a33c9`](https://github.com/clauderic/dnd-kit/commit/00a33c99e777ab205a45309a4efc8b3560bafdaf) Thanks [@MateusJabour](https://github.com/MateusJabour)! - Adds new `data` property to `Collision` type

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.1.0
  - @dnd-kit/state@0.1.0

## 0.0.10

### Patch Changes

- Updated dependencies []:
  - @dnd-kit/geometry@0.0.10
  - @dnd-kit/state@0.0.10

## 0.0.9

### Patch Changes

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`e36d954`](https://github.com/clauderic/dnd-kit/commit/e36d95420148659ba78bdbefd3a0a24ec5d02b8f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `nativeEvent` property to `dragstart`, `dragmove` and `dragend` events. This can be used to distinguish user triggered events from sensor triggered events, as user or plugin triggered events will typically not have an associated `event` attached.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`b7f1cf8`](https://github.com/clauderic/dnd-kit/commit/b7f1cf8f9e15a285c45f896e092f61001335cdff) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug in the `CollisionObserver` where the initial set of collisions when a drag operation is initiated were not being set and notified.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`3e629cc`](https://github.com/clauderic/dnd-kit/commit/3e629cc81dbaf9d112c4f1d2c10c75eb6779cf4e) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added the option to trigger `move` actions that are not propagated to `dragmove` listeners. This can be useful when firing a `dragmove` action in response to another `dragmove` event to avoid an infinite loop.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`ce31da7`](https://github.com/clauderic/dnd-kit/commit/ce31da736ec5d4f48bab45430be7b57223d60ee7) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `dragOperation.shape.initial` to the list of dependencies that cause the `transform` and `modifiers` to be re-calculated.

- Updated dependencies [[`60e7297`](https://github.com/clauderic/dnd-kit/commit/60e72979850bfe4cbb8e2b2e2b8e84bce9edc9f5), [`8ae7014`](https://github.com/clauderic/dnd-kit/commit/8ae70143bc404bff7678fa8e8390a640c16f2579)]:
  - @dnd-kit/geometry@0.0.9
  - @dnd-kit/state@0.0.9

## 0.0.8

### Patch Changes

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`c9716cf`](https://github.com/clauderic/dnd-kit/commit/c9716cf7b8b846faab451bd2f60c53c77d2d24ba) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `isDragging` and `isDropping` properties to `draggable` and `sortable` instances.

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`3ea0d31`](https://github.com/clauderic/dnd-kit/commit/3ea0d314649b186bfe0524d50145625da13a8787) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added optional `register` argument to instances of `Entity` to disable automatic registration of instances that have a manager supplied on initialization.

- [#1597](https://github.com/clauderic/dnd-kit/pull/1597) [`3cf4db1`](https://github.com/clauderic/dnd-kit/commit/3cf4db126813ebe6ddfc025df5e42e9bfcfa9c38) Thanks [@clauderic](https://github.com/clauderic)! - Added the `registerEffect` method that can be invoked by sub-classes that extend the base `Plugin` class to register effects and automatically dispose of them when the plugin instance is destroyed.

- Updated dependencies []:
  - @dnd-kit/geometry@0.0.8
  - @dnd-kit/state@0.0.8

## 0.0.7

### Patch Changes

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`c1dadef`](https://github.com/clauderic/dnd-kit/commit/c1dadef118f8f5f096d36dac314bfe317ea950ce) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fire a cancelled `dragend` event when a drag operation is interrupted by the `DragDropManager` being destroyed during an operation.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`cef9b46`](https://github.com/clauderic/dnd-kit/commit/cef9b46c5ed017e6a601b1d0ee9d0f05b7bbd19f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix global modifiers set on `DragDropManager` / `<DragDropProvider>` being destroyed after the first drag operation.

- Updated dependencies []:
  - @dnd-kit/geometry@0.0.7
  - @dnd-kit/state@0.0.7

## 0.0.6

### Patch Changes

- [#1553](https://github.com/clauderic/dnd-kit/pull/1553) [`984b5ab`](https://github.com/clauderic/dnd-kit/commit/984b5ab7bec3145dedb9c9b3b560ffbf7e54b919) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Reconfigure the manager when the input changes.

- [#1567](https://github.com/clauderic/dnd-kit/pull/1567) [`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Add source maps to output.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69) Thanks [@github-actions](https://github.com/apps/github-actions)! - Rework how collisions are detected and how the position of elements is observed using a new `PositionObserver`.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a8542de`](https://github.com/clauderic/dnd-kit/commit/a8542de56d39c3cd3b6ef981172a0782454295b2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix issues with `collisionPriority` not being respected.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`f7458d9`](https://github.com/clauderic/dnd-kit/commit/f7458d9dc32824dbea3a6d5dfb29236f19a2c073) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug where the `accept` function of `Droppable` was never invoked if the `draggable` did not have a `type` set.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`e70b29a`](https://github.com/clauderic/dnd-kit/commit/e70b29ae64837e424f7279c95112fb6e420c4dcc) Thanks [@github-actions](https://github.com/apps/github-actions)! - Make sure the generic for `DragDropManager` is passed through to `Entity` so that the `manager` reference on classes extending `Entity` is strongly typed.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`4d1a030`](https://github.com/clauderic/dnd-kit/commit/4d1a0306c920ae064eb5b30c4c02961f50460c84) Thanks [@github-actions](https://github.com/apps/github-actions)! - Make sure the cleanup function of effects is invoked when registering a new instance with the same `id` before the old instance has been unregistered.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a5933d8`](https://github.com/clauderic/dnd-kit/commit/a5933d8607e63ed08818ffab43e858863cb35d47) Thanks [@github-actions](https://github.com/apps/github-actions)! - Move responsibility from `CollisionObserver` to `CollisionNotifier` to check if the previous collisions are equal to the next collisions.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a5a556a`](https://github.com/clauderic/dnd-kit/commit/a5a556abfeec1d78effb3e047f529555e444c020) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed React lifecycle regressions related to StrictMode.

- [#1448](https://github.com/clauderic/dnd-kit/pull/1448) [`96f28ef`](https://github.com/clauderic/dnd-kit/commit/96f28ef86adf95e77540732d39033c7f3fb0fd04) Thanks [@lfades](https://github.com/lfades)! - Allow entities to receive a new id during the lifecycle of the entity

- Updated dependencies [[`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0), [`b750c05`](https://github.com/clauderic/dnd-kit/commit/b750c05b4b14f5d9817dc07d974d40b74470e904), [`71dc39f`](https://github.com/clauderic/dnd-kit/commit/71dc39fb2ec21b9a680238a91be419c71ecabe86)]:
  - @dnd-kit/geometry@0.0.6
  - @dnd-kit/state@0.0.6

## 0.0.5

### Patch Changes

- [`e9be505`](https://github.com/clauderic/dnd-kit/commit/e9be5051b5c99e522fb6efd028d425220b171890) Thanks [@clauderic](https://github.com/clauderic)! - Fix lifecycle of local modifiers now that it's possible to initialize a Draggable instance without a manager instance.

- Updated dependencies []:
  - @dnd-kit/geometry@0.0.5
  - @dnd-kit/state@0.0.5

## 0.0.4

### Patch Changes

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177) Thanks [@clauderic](https://github.com/clauderic)! - Added `status` property to draggable instances to know the current status of a draggable instance. Useful to know if an instance is being dropped.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98) Thanks [@clauderic](https://github.com/clauderic)! - Refactor the lifecycle to allow `manager` to be optional and provided later during the lifecycle of `draggable` / `droppable` / `sortable` instances.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3) Thanks [@clauderic](https://github.com/clauderic)! - Removed `options` and `options.register` from `Entity` base class. Passing an `undefined` manager when instantiating `Draggable` and `Droppable` now has the same effect.

- Updated dependencies [[`a4d9150`](https://github.com/clauderic/dnd-kit/commit/a4d91500124698abf58355592913f84d438faa3d)]:
  - @dnd-kit/state@0.0.4
  - @dnd-kit/geometry@0.0.4

## 0.0.3

### Patch Changes

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`5ccd5e6`](https://github.com/clauderic/dnd-kit/commit/5ccd5e668fb8d736ec3c195116559cb5c5684e80) Thanks [@clauderic](https://github.com/clauderic)! - Add the ability for modifiers to be set dynamically on the `Draggable` instances

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`886de33`](https://github.com/clauderic/dnd-kit/commit/886de33d0df851ebdcb3fcf2915f9623069b06d1) Thanks [@clauderic](https://github.com/clauderic)! - Introduced `SnapModifier` to snap to grid

- Updated dependencies []:
  - @dnd-kit/geometry@0.0.3
  - @dnd-kit/state@0.0.3

## 0.0.2

### Patch Changes

- Updated dependencies [[`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2)]:
  - @dnd-kit/state@0.0.2
  - @dnd-kit/geometry@0.0.2
