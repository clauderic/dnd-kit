# @dnd-kit/sortable

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
