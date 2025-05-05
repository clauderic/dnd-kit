# @dnd-kit/state

## 0.1.9

## 0.1.8

## 0.1.7

## 0.1.6

### Patch Changes

- [`299389b`](https://github.com/clauderic/dnd-kit/commit/299389befcc747fe8d79231ba32f73afae88615e) Thanks [@clauderic](https://github.com/clauderic)! - Fix cycle in `ValueHistory` setter for current

## 0.1.5

## 0.1.4

## 0.1.3

### Patch Changes

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`8f91d91`](https://github.com/clauderic/dnd-kit/commit/8f91d9112608d2077c3b6c8fc939aa052606148c) Thanks [@github-actions](https://github.com/apps/github-actions)! - Remove `queueMicrotask` from constructor of `ValueHistory`.

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`9a0edf6`](https://github.com/clauderic/dnd-kit/commit/9a0edf64cbde1bd761f3650e043b6612e61a5fab) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor Sortable store implementation to use a new `WeakStore` class

  - Add new `WeakStore` constructor in `@dnd-kit/state` package
  - Replace Map-based store implementation in Sortable with new WeakStore utility

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`a9db4c7`](https://github.com/clauderic/dnd-kit/commit/a9db4c73467d9eda9f95fe5b582948c9fc735f57) Thanks [@github-actions](https://github.com/apps/github-actions)! - Update `@preact/signals-core` from v1.6.0 to v1.8.0

## 0.1.2

### Patch Changes

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add new state management features:

  - Add `ValueHistory` class for tracking value changes over time
  - Add `enumerable` decorator for controlling property enumeration
  - Add `snapshot` utility for creating immutable copies of reactive objects
  - Refactor `Position` class to extend `ValueHistory` for better state tracking

## 0.1.1

## 0.1.0

## 0.0.10

## 0.0.9

## 0.0.8

## 0.0.7

## 0.0.6

### Patch Changes

- [#1567](https://github.com/clauderic/dnd-kit/pull/1567) [`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Add source maps to output.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`b750c05`](https://github.com/clauderic/dnd-kit/commit/b750c05b4b14f5d9817dc07d974d40b74470e904) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug with comparing functions incorrectly for equality in `deepEqual` utility.

## 0.0.5

## 0.0.4

### Patch Changes

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`a4d9150`](https://github.com/clauderic/dnd-kit/commit/a4d91500124698abf58355592913f84d438faa3d) Thanks [@clauderic](https://github.com/clauderic)! - Refactor decorators to use the [latest decorators API](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators) rather than the experimental API.

## 0.0.3

## 0.0.2

### Patch Changes

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2) Thanks [@clauderic](https://github.com/clauderic)! - - `deepEqual`: Handle comparing `Set` instances
