# @dnd-kit/core

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
