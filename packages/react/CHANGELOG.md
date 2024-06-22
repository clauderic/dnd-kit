# @dnd-kit/react

## 0.0.4

### Patch Changes

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `status` property to draggable instances to know the current status of a draggable instance. Useful to know if an instance is being dropped.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor the lifecycle to allow `manager` to be optional and provided later during the lifecycle of `draggable` / `droppable` / `sortable` instances.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3) Thanks [@github-actions](https://github.com/apps/github-actions)! - Removed `options` and `options.register` from `Entity` base class. Passing an `undefined` manager when instantiating `Draggable` and `Droppable` now has the same effect.

- Updated dependencies [[`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177), [`1b9df29`](https://github.com/clauderic/dnd-kit/commit/1b9df29e03306c6d3fb3e8b2b321486f5c62847a), [`4dbcb1c`](https://github.com/clauderic/dnd-kit/commit/4dbcb1c87c34273fecf7257cd4cb5ac67b42d3a4), [`a4d9150`](https://github.com/clauderic/dnd-kit/commit/a4d91500124698abf58355592913f84d438faa3d), [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98), [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3)]:
  - @dnd-kit/abstract@0.0.4
  - @dnd-kit/dom@0.0.4
  - @dnd-kit/state@0.0.4

## 0.0.3

### Patch Changes

- [`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59) Thanks [@clauderic](https://github.com/clauderic)! - Fixed lifecycle related issues.

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`86e5191`](https://github.com/clauderic/dnd-kit/commit/86e519187f0072761321e44cb11abf2f4797169e) Thanks [@clauderic](https://github.com/clauderic)! - Fixed a bug where `useDraggable`, `useDroppable` and `useSortable` would not un-register from the old manager and re-register themselves with the new manager when its reference changes.

- [`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59) Thanks [@clauderic](https://github.com/clauderic)! - Add lazy import for `DragDropProvider`.

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`5ccd5e6`](https://github.com/clauderic/dnd-kit/commit/5ccd5e668fb8d736ec3c195116559cb5c5684e80) Thanks [@clauderic](https://github.com/clauderic)! - Update modifiers on the `Draggable` instances when `useDraggable` receives updated modifiers

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`8f421ee`](https://github.com/clauderic/dnd-kit/commit/8f421ee00201435ead41ac4c45dae72bf030b5a5) Thanks [@clauderic](https://github.com/clauderic)! - Add `"use client"` hints to `@dnd-kit/react` exports.

- Updated dependencies [[`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59), [`8e45c2a`](https://github.com/clauderic/dnd-kit/commit/8e45c2a9d750283296b56b05a887be89fe7b0184), [`5ccd5e6`](https://github.com/clauderic/dnd-kit/commit/5ccd5e668fb8d736ec3c195116559cb5c5684e80), [`886de33`](https://github.com/clauderic/dnd-kit/commit/886de33d0df851ebdcb3fcf2915f9623069b06d1)]:
  - @dnd-kit/dom@0.0.3
  - @dnd-kit/abstract@0.0.3
  - @dnd-kit/state@0.0.3

## 0.0.2

### Patch Changes

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2) Thanks [@clauderic](https://github.com/clauderic)! - - `useDraggable`: Fixed a bug where the `element` was not properly being set on initialization

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`2c3ad5e`](https://github.com/clauderic/dnd-kit/commit/2c3ad5eab3aabfd0aaa5a3a299dae1e307e8edaf) Thanks [@clauderic](https://github.com/clauderic)! - - Fix issues with `<StrictMode>` in React

- Updated dependencies [[`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2), [`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2), [`d273f70`](https://github.com/clauderic/dnd-kit/commit/d273f700c3f580cb781bd004ed025bbceee20c4e), [`34c6fdc`](https://github.com/clauderic/dnd-kit/commit/34c6fdc6fb20c092a9370e35f22bf55d8065130c), [`2c3ad5e`](https://github.com/clauderic/dnd-kit/commit/2c3ad5eab3aabfd0aaa5a3a299dae1e307e8edaf)]:
  - @dnd-kit/dom@0.0.2
  - @dnd-kit/state@0.0.2
  - @dnd-kit/abstract@0.0.2
