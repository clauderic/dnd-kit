# @dnd-kit/svelte

## 0.4.0

### Minor Changes

- [#1915](https://github.com/clauderic/dnd-kit/pull/1915) [`9b24dff`](https://github.com/clauderic/dnd-kit/commit/9b24dffde9a4b58140e5dd8c10e2766dabe42c00) Thanks [@clauderic](https://github.com/clauderic)! - Redesign event type system to follow the DOM EventMap pattern. Introduces `DragDropEventMap` for event object types and `DragDropEventHandlers` for event handler signatures, replacing the ambiguously named `DragDropEvents`. Event type aliases (`CollisionEvent`, `DragStartEvent`, etc.) now derive directly from `DragDropEventMap` rather than using `Parameters<>` extraction.

  ### Migration guide

  - **`DragDropEvents`** has been split into two types:
    - `DragDropEventMap` — maps event names to event object types (like `WindowEventMap`)
    - `DragDropEventHandlers` — maps event names to `(event, manager) => void` handler signatures
  - If you were importing `DragDropEvents` to type **event objects**, use `DragDropEventMap` instead:
    ```ts
    // Before
    type MyEvent = Parameters<DragDropEvents<D, P, M>['dragend']>[0];
    // After
    type MyEvent = DragDropEventMap<D, P, M>['dragend'];
    ```
  - If you were importing `DragDropEvents` to type **event handlers**, use `DragDropEventHandlers` instead:
    ```ts
    // Before
    const handler: DragDropEvents<D, P, M>['dragend'] = (event, manager) => {};
    // After
    const handler: DragDropEventHandlers<D, P, M>['dragend'] = (
      event,
      manager
    ) => {};
    ```
  - The `DragDropEvents` re-export from `@dnd-kit/react` and `@dnd-kit/solid` has been removed. Import `DragDropEventMap` or `DragDropEventHandlers` from `@dnd-kit/abstract` directly if needed.
  - Convenience aliases (`CollisionEvent`, `DragStartEvent`, `DragEndEvent`, etc.) are unchanged and continue to work as before.

- [#1938](https://github.com/clauderic/dnd-kit/pull/1938) [`e69387d`](https://github.com/clauderic/dnd-kit/commit/e69387d2906872310e56ecea4d75f7fa18db4f56) Thanks [@clauderic](https://github.com/clauderic)! - Added per-entity plugin configuration and moved `feedback` from the Draggable entity to the Feedback plugin.

  Draggable entities now accept a `plugins` property for per-entity plugin configuration, using the existing `Plugin.configure()` pattern. Plugins can read per-entity options via `source.pluginConfig(PluginClass)`.

  The `feedback` property (`'default' | 'move' | 'clone' | 'none'`) has been moved from the Draggable entity to `FeedbackOptions`. Drop animation can also now be configured per-draggable.

  Plugins listed in an entity's `plugins` array are auto-registered on the manager if not already present. The Sortable class now uses this generic mechanism instead of its own custom registration logic.

  ### Migration guide

  The `feedback` property has been moved from the draggable/sortable hook input to per-entity Feedback plugin configuration.

  **Before:**

  ```tsx
  import {FeedbackType} from '@dnd-kit/dom';

  useDraggable({id: 'item', feedback: 'clone'});
  useSortable({id: 'item', index: 0, feedback: 'clone'});
  ```

  **After:**

  ```tsx
  import {Feedback} from '@dnd-kit/dom';

  useDraggable({
    id: 'item',
    plugins: [Feedback.configure({feedback: 'clone'})],
  });
  useSortable({
    id: 'item',
    index: 0,
    plugins: [Feedback.configure({feedback: 'clone'})],
  });
  ```

  Drop animation can now be configured per-draggable:

  ```tsx
  useDraggable({
    id: 'item',
    plugins: [Feedback.configure({feedback: 'clone', dropAnimation: null})],
  });
  ```

### Patch Changes

- Updated dependencies [[`4bc7e71`](https://github.com/clauderic/dnd-kit/commit/4bc7e7108373b1eb7eef0de832b25ca93ce7bf40), [`87bf1e6`](https://github.com/clauderic/dnd-kit/commit/87bf1e66fb7432735bb8d7ba84758d128df5ab18), [`c001272`](https://github.com/clauderic/dnd-kit/commit/c00127288ca2ea7ecb8e8d9079f1b3a43db75362), [`cde61e4`](https://github.com/clauderic/dnd-kit/commit/cde61e4b4551f9094f44d9281f65028f85df9813), [`1328af8`](https://github.com/clauderic/dnd-kit/commit/1328af851069e267838102cbf5481ee26ceeddf0), [`bfff7de`](https://github.com/clauderic/dnd-kit/commit/bfff7de1bf8020e7643adf45ca31c4c08f98501d), [`9b24dff`](https://github.com/clauderic/dnd-kit/commit/9b24dffde9a4b58140e5dd8c10e2766dabe42c00), [`8115a57`](https://github.com/clauderic/dnd-kit/commit/8115a57f1191af78dd641933af34c9c37f8dcb3c), [`688e00f`](https://github.com/clauderic/dnd-kit/commit/688e00fffb7535b8027a9c5947d006a875f42d16), [`e69387d`](https://github.com/clauderic/dnd-kit/commit/e69387d2906872310e56ecea4d75f7fa18db4f56), [`11ff2eb`](https://github.com/clauderic/dnd-kit/commit/11ff2eb1bc408468b77a29510133b2581b3d3111), [`7489265`](https://github.com/clauderic/dnd-kit/commit/74892651b32bc84e2f527a779257d946d923400d), [`4e35963`](https://github.com/clauderic/dnd-kit/commit/4e35963d427d835285a1f10df96899502d327d68)]:
  - @dnd-kit/dom@0.4.0
  - @dnd-kit/abstract@0.4.0
  - @dnd-kit/state@0.4.0

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

- [`68e44de`](https://github.com/clauderic/dnd-kit/commit/68e44deb6f824b38a58d9b4b1bd81e2efa9193f9) Thanks [@clauderic](https://github.com/clauderic)! - Add `isSortableOperation` type guard and export `SortableDraggable`/`SortableDroppable` types.

  `isSortableOperation(operation)` narrows a `DragOperationSnapshot` so that `source` is typed as `SortableDraggable` and `target` as `SortableDroppable`, providing typed access to sortable-specific properties like `index`, `initialIndex`, `group`, and `initialGroup`.

  Re-exported from all framework packages (`@dnd-kit/react/sortable`, `@dnd-kit/vue/sortable`, `@dnd-kit/svelte/sortable`, `@dnd-kit/solid/sortable`).

- [`e630ec0`](https://github.com/clauderic/dnd-kit/commit/e630ec02f3819c1c5e3a4fcd05d0c65850ffaa0b) Thanks [@clauderic](https://github.com/clauderic)! - Initial release of @dnd-kit/svelte – a Svelte 5 adapter for dnd kit. Provides `DragDropProvider`, `DragOverlay`, `createDraggable`, `createDroppable`, and `createSortable` using Svelte 5 runes and attachments (`{@attach}`).

### Patch Changes

- Updated dependencies [[`6a59647`](https://github.com/clauderic/dnd-kit/commit/6a59647ebba2114b2e423f282ab25bf2ea40318d), [`5d64078`](https://github.com/clauderic/dnd-kit/commit/5d640782702b74da8be38cbd1e29271d04781854), [`863ce2b`](https://github.com/clauderic/dnd-kit/commit/863ce2b74ec0f4d630f4b7036c363bc2e3d04f24), [`863ce2b`](https://github.com/clauderic/dnd-kit/commit/863ce2b74ec0f4d630f4b7036c363bc2e3d04f24), [`e8ae539`](https://github.com/clauderic/dnd-kit/commit/e8ae539abe05a1df41d45078b108167022ac9ef7), [`41d7e27`](https://github.com/clauderic/dnd-kit/commit/41d7e27edb30cea9940cd5c46c6fcc81f7b401a6), [`68e44de`](https://github.com/clauderic/dnd-kit/commit/68e44deb6f824b38a58d9b4b1bd81e2efa9193f9)]:
  - @dnd-kit/abstract@0.3.0
  - @dnd-kit/dom@0.3.0
  - @dnd-kit/state@0.3.0
