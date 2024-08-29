# @dnd-kit/dom

## 0.0.6

### Patch Changes

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`f400106`](https://github.com/clauderic/dnd-kit/commit/f400106072d12a902f6c113b889c7de97f43e1ea) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improve the `Feedback` plugin to better handle when the feedback element resizes during a drag operation.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`f219549`](https://github.com/clauderic/dnd-kit/commit/f219549087d9100cee53ab0cf35d820fe256aa85) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix pointer events no longer being detected by the `PointerSensor` when the event target is disconnected from the DOM by setting pointer capture on the document body for `pointermove` events.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`bfc8ab2`](https://github.com/clauderic/dnd-kit/commit/bfc8ab21cfd9c16a8d90ab250386e6d52d0a40a3) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**: Defer invoking `setPointerCapture` until activation constraints are met as it can interfere with `click` and other event handlers. Also deferred adding `touchmove`, `click` and `keydown` event listeners until the activation constraints are met.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`69bfad7`](https://github.com/clauderic/dnd-kit/commit/69bfad7d795947987a4281f1a61f81b6a7839fe8) Thanks [@github-actions](https://github.com/apps/github-actions)! - `SortableKeyboardPlugin`: Use `closestCorners` collision detection algorithm instead of `closestCenter` when keyboard sorting.

- Updated dependencies [[`69bfad7`](https://github.com/clauderic/dnd-kit/commit/69bfad7d795947987a4281f1a61f81b6a7839fe8), [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69), [`a8542de`](https://github.com/clauderic/dnd-kit/commit/a8542de56d39c3cd3b6ef981172a0782454295b2), [`a6366f9`](https://github.com/clauderic/dnd-kit/commit/a6366f9e42836b4c5732141bf314489ede9f60cb), [`96f28ef`](https://github.com/clauderic/dnd-kit/commit/96f28ef86adf95e77540732d39033c7f3fb0fd04)]:
  - @dnd-kit/collision@0.0.6
  - @dnd-kit/abstract@0.0.6
  - @dnd-kit/geometry@0.0.6
  - @dnd-kit/state@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [[`e9be505`](https://github.com/clauderic/dnd-kit/commit/e9be5051b5c99e522fb6efd028d425220b171890)]:
  - @dnd-kit/abstract@0.0.5
  - @dnd-kit/collision@0.0.5
  - @dnd-kit/geometry@0.0.5
  - @dnd-kit/state@0.0.5

## 0.0.4

### Patch Changes

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177) Thanks [@clauderic](https://github.com/clauderic)! - Added `status` property to draggable instances to know the current status of a draggable instance. Useful to know if an instance is being dropped.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`1b9df29`](https://github.com/clauderic/dnd-kit/commit/1b9df29e03306c6d3fb3e8b2b321486f5c62847a) Thanks [@clauderic](https://github.com/clauderic)! - Force pointer events on children of the feedback element to `none`.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`4dbcb1c`](https://github.com/clauderic/dnd-kit/commit/4dbcb1c87c34273fecf7257cd4cb5ac67b42d3a4) Thanks [@clauderic](https://github.com/clauderic)! - Fix bugs with PointerSensor when interacting with anchor or image elements.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98) Thanks [@clauderic](https://github.com/clauderic)! - Refactor the lifecycle to allow `manager` to be optional and provided later during the lifecycle of `draggable` / `droppable` / `sortable` instances.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3) Thanks [@clauderic](https://github.com/clauderic)! - Removed `options` and `options.register` from `Entity` base class. Passing an `undefined` manager when instantiating `Draggable` and `Droppable` now has the same effect.

- Updated dependencies [[`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177), [`a4d9150`](https://github.com/clauderic/dnd-kit/commit/a4d91500124698abf58355592913f84d438faa3d), [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98), [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3)]:
  - @dnd-kit/abstract@0.0.4
  - @dnd-kit/state@0.0.4
  - @dnd-kit/collision@0.0.4
  - @dnd-kit/geometry@0.0.4

## 0.0.3

### Patch Changes

- [`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59) Thanks [@clauderic](https://github.com/clauderic)! - Fixed lifecycle related issues.

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`8e45c2a`](https://github.com/clauderic/dnd-kit/commit/8e45c2a9d750283296b56b05a887be89fe7b0184) Thanks [@clauderic](https://github.com/clauderic)! - Better handling of elements that have `transform` or `translate` applied. The Feedback and Sortable plugins now no longer need to ignore transforms as the `DOMRectangle` can compute the projected final coordinates of an element that has transforms applied even if it is currently being animated by looking at the last animation keyframe.

- Updated dependencies [[`5ccd5e6`](https://github.com/clauderic/dnd-kit/commit/5ccd5e668fb8d736ec3c195116559cb5c5684e80), [`886de33`](https://github.com/clauderic/dnd-kit/commit/886de33d0df851ebdcb3fcf2915f9623069b06d1)]:
  - @dnd-kit/abstract@0.0.3
  - @dnd-kit/collision@0.0.3
  - @dnd-kit/geometry@0.0.3
  - @dnd-kit/state@0.0.3

## 0.0.2

### Patch Changes

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2) Thanks [@clauderic](https://github.com/clauderic)! - - `Sortable`: Fixed a bug with optimistic re-ordering.

  - `Scroller`: Fixed a bug with auto-scrolling when target is position fixed

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`d273f70`](https://github.com/clauderic/dnd-kit/commit/d273f700c3f580cb781bd004ed025bbceee20c4e) Thanks [@clauderic](https://github.com/clauderic)! - - `Feedback`: Fixed a bug with transitions being interrupted on drop when the draggable element has not been moved.

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`34c6fdc`](https://github.com/clauderic/dnd-kit/commit/34c6fdc6fb20c092a9370e35f22bf55d8065130c) Thanks [@clauderic](https://github.com/clauderic)! - - `AutoScroller`: Improve auto-scroller to continue scrolling even when outside the bounds of the element currently being scrolled.

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`2c3ad5e`](https://github.com/clauderic/dnd-kit/commit/2c3ad5eab3aabfd0aaa5a3a299dae1e307e8edaf) Thanks [@clauderic](https://github.com/clauderic)! - - `Feedback`: Only restore focus after drop if the `activatorEvent` is a keyboard event.

- Updated dependencies [[`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2)]:
  - @dnd-kit/state@0.0.2
  - @dnd-kit/abstract@0.0.2
  - @dnd-kit/geometry@0.0.2
  - @dnd-kit/collision@0.0.2
