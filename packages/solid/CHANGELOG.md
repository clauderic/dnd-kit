# @dnd-kit/solid

## 0.3.2

### Patch Changes

- Updated dependencies [[`7260746`](https://github.com/clauderic/dnd-kit/commit/7260746b0930d51afb3098ef120bffd7d3aaea03)]:
  - @dnd-kit/dom@0.3.2
  - @dnd-kit/abstract@0.3.2
  - @dnd-kit/state@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [[`4341114`](https://github.com/clauderic/dnd-kit/commit/43411143063349caeded4f778923473624ce25cf)]:
  - @dnd-kit/abstract@0.3.1
  - @dnd-kit/dom@0.3.1
  - @dnd-kit/state@0.3.1

## 0.3.0

### Minor Changes

- [`6a59647`](https://github.com/clauderic/dnd-kit/commit/6a59647ebba2114b2e423f282ab25bf2ea40318d) Thanks [@clauderic](https://github.com/clauderic)! - Allow `plugins`, `sensors`, and `modifiers` to accept a function that receives the defaults, making it easy to extend or configure them without replacing the entire array.

  ```ts
  // Add a plugin alongside the defaults
  const manager = new DragDropManager({
    plugins: (defaults) => [...defaults, MyPlugin],
  });
  ```

  ```tsx
  // Configure a default plugin in React
  <DragDropProvider
    plugins={(defaults) => [
      ...defaults,
      Feedback.configure({dropAnimation: null}),
    ]}
  />
  ```

  Previously, passing `plugins`, `sensors`, or `modifiers` would replace the defaults entirely, requiring consumers to import and spread `defaultPreset`. The function form receives the default values as an argument, so consumers can add, remove, or configure individual entries without needing to know or maintain the full default list.

- [#1881](https://github.com/clauderic/dnd-kit/pull/1881) [`69f2772`](https://github.com/clauderic/dnd-kit/commit/69f27726efd3e2487eedc99606fc6f060ee0b92c) Thanks [@clauderic](https://github.com/clauderic)! - Add @dnd-kit/solid adapter package for SolidJS

- [`68e44de`](https://github.com/clauderic/dnd-kit/commit/68e44deb6f824b38a58d9b4b1bd81e2efa9193f9) Thanks [@clauderic](https://github.com/clauderic)! - Add `isSortableOperation` type guard and export `SortableDraggable`/`SortableDroppable` types.

  `isSortableOperation(operation)` narrows a `DragOperationSnapshot` so that `source` is typed as `SortableDraggable` and `target` as `SortableDroppable`, providing typed access to sortable-specific properties like `index`, `initialIndex`, `group`, and `initialGroup`.

  Re-exported from all framework packages (`@dnd-kit/react/sortable`, `@dnd-kit/vue/sortable`, `@dnd-kit/svelte/sortable`, `@dnd-kit/solid/sortable`).

### Patch Changes

- [`5d64078`](https://github.com/clauderic/dnd-kit/commit/5d640782702b74da8be38cbd1e29271d04781854) Thanks [@clauderic](https://github.com/clauderic)! - Add `dropAnimation` prop to the `DragOverlay` component to allow consumers to disable or customize the drop animation that plays when a drag operation ends. Set to `null` to disable, pass `{duration, easing}` to customize timing, or provide a custom animation function for full control.

- Updated dependencies [[`6a59647`](https://github.com/clauderic/dnd-kit/commit/6a59647ebba2114b2e423f282ab25bf2ea40318d), [`5d64078`](https://github.com/clauderic/dnd-kit/commit/5d640782702b74da8be38cbd1e29271d04781854), [`863ce2b`](https://github.com/clauderic/dnd-kit/commit/863ce2b74ec0f4d630f4b7036c363bc2e3d04f24), [`863ce2b`](https://github.com/clauderic/dnd-kit/commit/863ce2b74ec0f4d630f4b7036c363bc2e3d04f24), [`e8ae539`](https://github.com/clauderic/dnd-kit/commit/e8ae539abe05a1df41d45078b108167022ac9ef7), [`41d7e27`](https://github.com/clauderic/dnd-kit/commit/41d7e27edb30cea9940cd5c46c6fcc81f7b401a6), [`68e44de`](https://github.com/clauderic/dnd-kit/commit/68e44deb6f824b38a58d9b4b1bd81e2efa9193f9)]:
  - @dnd-kit/abstract@0.3.0
  - @dnd-kit/dom@0.3.0
  - @dnd-kit/state@0.3.0
