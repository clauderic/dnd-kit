# @dnd-kit/abstract

## 0.0.6

### Patch Changes

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69) Thanks [@github-actions](https://github.com/apps/github-actions)! - Rework how collisions are detected and how the position of elements is observed using a new `PositionObserver`.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a8542de`](https://github.com/clauderic/dnd-kit/commit/a8542de56d39c3cd3b6ef981172a0782454295b2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix issues with `collisionPriority` not being respected.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`f7458d9`](https://github.com/clauderic/dnd-kit/commit/f7458d9dc32824dbea3a6d5dfb29236f19a2c073) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug where the `accept` function of `Droppable` was never invoked if the `draggable` did not have a `type` set.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`e70b29a`](https://github.com/clauderic/dnd-kit/commit/e70b29ae64837e424f7279c95112fb6e420c4dcc) Thanks [@github-actions](https://github.com/apps/github-actions)! - Make sure the generic for `DragDropManager` is passed through to `Entity` so that the `manager` reference on classes extending `Entity` is strongly typed.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`4d1a030`](https://github.com/clauderic/dnd-kit/commit/4d1a0306c920ae064eb5b30c4c02961f50460c84) Thanks [@github-actions](https://github.com/apps/github-actions)! - Make sure the cleanup function of effects is invoked when registering a new instance with the same `id` before the old instance has been unregistered.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a5933d8`](https://github.com/clauderic/dnd-kit/commit/a5933d8607e63ed08818ffab43e858863cb35d47) Thanks [@github-actions](https://github.com/apps/github-actions)! - Move responsibility from `CollisionObserver` to `CollisionNotifier` to check if the previous collisions are equal to the next collisions.

- [#1448](https://github.com/clauderic/dnd-kit/pull/1448) [`96f28ef`](https://github.com/clauderic/dnd-kit/commit/96f28ef86adf95e77540732d39033c7f3fb0fd04) Thanks [@lfades](https://github.com/lfades)! - Allow entities to receive a new id during the lifecycle of the entity

- Updated dependencies [[`b750c05`](https://github.com/clauderic/dnd-kit/commit/b750c05b4b14f5d9817dc07d974d40b74470e904), [`71dc39f`](https://github.com/clauderic/dnd-kit/commit/71dc39fb2ec21b9a680238a91be419c71ecabe86)]:
  - @dnd-kit/state@0.0.6
  - @dnd-kit/geometry@0.0.6

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
