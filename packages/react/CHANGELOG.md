# @dnd-kit/react

## 0.0.6

### Patch Changes

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`d26fafe`](https://github.com/clauderic/dnd-kit/commit/d26fafe02c0d3018df03ac3ff2bbd95602ed87ed) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent un-necessary re-renders of unused `useSignal` values.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`d302511`](https://github.com/clauderic/dnd-kit/commit/d302511c96e11e30763361aa6a88d1eb6c6dc0f1) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent unstable `ref` from being set to undefined during a drag operation on draggable sources during a drag operation.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`e2f5d93`](https://github.com/clauderic/dnd-kit/commit/e2f5d935cd21303c9877ce46f7642de7fc9b1ae8) Thanks [@github-actions](https://github.com/apps/github-actions)! - `useSortable`: Make sure `group` and `index` are updated at the same time.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`ff17c04`](https://github.com/clauderic/dnd-kit/commit/ff17c0497ba5604648319917ff327bd52518d426) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow dependencies to be passed to `useComputed` hook.

- Updated dependencies [[`d436037`](https://github.com/clauderic/dnd-kit/commit/d43603740a4d056e9fc7501e9b2117c173b1df4d), [`94920c8`](https://github.com/clauderic/dnd-kit/commit/94920c8a7a3a15accfb806b52e4935637b1a0781), [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69), [`8053e4b`](https://github.com/clauderic/dnd-kit/commit/8053e4b4a727c6097b29fb559ce72362d7d6eb2a), [`f400106`](https://github.com/clauderic/dnd-kit/commit/f400106072d12a902f6c113b889c7de97f43e1ea), [`c597b3f`](https://github.com/clauderic/dnd-kit/commit/c597b3fe1514f10e227c287dc8ad875134e9b4cb), [`a8542de`](https://github.com/clauderic/dnd-kit/commit/a8542de56d39c3cd3b6ef981172a0782454295b2), [`a9798f4`](https://github.com/clauderic/dnd-kit/commit/a9798f43450e406e8cb235b7d5fba8bb809fd1d7), [`f7458d9`](https://github.com/clauderic/dnd-kit/commit/f7458d9dc32824dbea3a6d5dfb29236f19a2c073), [`b750c05`](https://github.com/clauderic/dnd-kit/commit/b750c05b4b14f5d9817dc07d974d40b74470e904), [`e70b29a`](https://github.com/clauderic/dnd-kit/commit/e70b29ae64837e424f7279c95112fb6e420c4dcc), [`3d0b00a`](https://github.com/clauderic/dnd-kit/commit/3d0b00a663b9dc38ccd7a46544c94a342694b626), [`4d1a030`](https://github.com/clauderic/dnd-kit/commit/4d1a0306c920ae064eb5b30c4c02961f50460c84), [`51be6df`](https://github.com/clauderic/dnd-kit/commit/51be6dfe1b8cb42f74df34c76098e197b9208f81), [`fe76033`](https://github.com/clauderic/dnd-kit/commit/fe7603330fb4b0a397c0e2af641df94fc2879c35), [`62a8118`](https://github.com/clauderic/dnd-kit/commit/62a81180c84f7782b14b69b56f891c810e7d0f69), [`a5933d8`](https://github.com/clauderic/dnd-kit/commit/a5933d8607e63ed08818ffab43e858863cb35d47), [`0c7bf85`](https://github.com/clauderic/dnd-kit/commit/0c7bf85897992dc48c3cf2f1deeaa896995bfcc3), [`f219549`](https://github.com/clauderic/dnd-kit/commit/f219549087d9100cee53ab0cf35d820fe256aa85), [`bfc8ab2`](https://github.com/clauderic/dnd-kit/commit/bfc8ab21cfd9c16a8d90ab250386e6d52d0a40a3), [`96f28ef`](https://github.com/clauderic/dnd-kit/commit/96f28ef86adf95e77540732d39033c7f3fb0fd04), [`3fb972e`](https://github.com/clauderic/dnd-kit/commit/3fb972e228aabfe07d662b77c642405f909fddb0), [`5b36f8f`](https://github.com/clauderic/dnd-kit/commit/5b36f8fb36f5a4468793b469425b5c0461426f56), [`69bfad7`](https://github.com/clauderic/dnd-kit/commit/69bfad7d795947987a4281f1a61f81b6a7839fe8)]:
  - @dnd-kit/dom@0.0.6
  - @dnd-kit/abstract@0.0.6
  - @dnd-kit/state@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [[`e9be505`](https://github.com/clauderic/dnd-kit/commit/e9be5051b5c99e522fb6efd028d425220b171890)]:
  - @dnd-kit/abstract@0.0.5
  - @dnd-kit/dom@0.0.5
  - @dnd-kit/state@0.0.5

## 0.0.4

### Patch Changes

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177) Thanks [@clauderic](https://github.com/clauderic)! - Added `status` property to draggable instances to know the current status of a draggable instance. Useful to know if an instance is being dropped.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98) Thanks [@clauderic](https://github.com/clauderic)! - Refactor the lifecycle to allow `manager` to be optional and provided later during the lifecycle of `draggable` / `droppable` / `sortable` instances.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3) Thanks [@clauderic](https://github.com/clauderic)! - Removed `options` and `options.register` from `Entity` base class. Passing an `undefined` manager when instantiating `Draggable` and `Droppable` now has the same effect.

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
