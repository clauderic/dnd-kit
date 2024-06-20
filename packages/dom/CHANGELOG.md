# @dnd-kit/dom

## 0.0.3

### Patch Changes

- [`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59) Thanks [@clauderic](https://github.com/clauderic)! - Fixed lifecycle related issues.

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`8e45c2a`](https://github.com/clauderic/dnd-kit/commit/8e45c2a9d750283296b56b05a887be89fe7b0184) Thanks [@github-actions](https://github.com/apps/github-actions)! - Better handling of elements that have `transform` or `translate` applied. The Feedback and Sortable plugins now no longer need to ignore transforms as the `DOMRectangle` can compute the projected final coordinates of an element that has transforms applied even if it is currently being animated by looking at the last animation keyframe.

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
