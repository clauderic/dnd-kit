# @dnd-kit/dom

## 0.4.0

### Minor Changes

- [#1909](https://github.com/clauderic/dnd-kit/pull/1909) [`87bf1e6`](https://github.com/clauderic/dnd-kit/commit/87bf1e66fb7432735bb8d7ba84758d128df5ab18) Thanks [@clauderic](https://github.com/clauderic)! - Add `acceleration` and `threshold` options to the `AutoScroller` plugin.

  - `acceleration` controls the base scroll speed multiplier (default: `25`).
  - `threshold` controls the percentage of container dimensions that defines the scroll activation zone (default: `0.2`). Accepts a single number for both axes or `{ x, y }` for per-axis control. Setting an axis to `0` disables auto-scrolling on that axis.

  ```ts
  AutoScroller.configure({
    acceleration: 15,
    threshold: {x: 0, y: 0.3},
  });
  ```

- [#1938](https://github.com/clauderic/dnd-kit/pull/1938) [`c001272`](https://github.com/clauderic/dnd-kit/commit/c00127288ca2ea7ecb8e8d9079f1b3a43db75362) Thanks [@clauderic](https://github.com/clauderic)! - The `DropAnimationFunction` context now includes `source`, providing access to the draggable entity for conditional animation logic.

  ```tsx
  Feedback.configure({
    dropAnimation: async (context) => {
      if (context.source.type === 'service-draggable') return;
      // custom animation...
    },
  });
  ```

- [#1923](https://github.com/clauderic/dnd-kit/pull/1923) [`cde61e4`](https://github.com/clauderic/dnd-kit/commit/cde61e4b4551f9094f44d9281f65028f85df9813) Thanks [@clauderic](https://github.com/clauderic)! - Batch entity identity changes to prevent collision oscillation during virtualized sorting.

  When entities swap ids (e.g. as `react-window` recycles DOM nodes during a drag), multiple registry updates could fire in an interleaved order, causing the collision detector to momentarily see stale or duplicate entries and oscillate between targets.

  Entity `id` changes are now deferred to a microtask and flushed atomically in a single `batch()`, ensuring:

  - The collision notifier skips detection while id changes are pending
  - The registry cleans up ghost registrations (stale keys left behind after an id swap)

- [#1908](https://github.com/clauderic/dnd-kit/pull/1908) [`1328af8`](https://github.com/clauderic/dnd-kit/commit/1328af851069e267838102cbf5481ee26ceeddf0) Thanks [@clauderic](https://github.com/clauderic)! - Add `keyboardTransition` option to the `Feedback` plugin for customizing or disabling the CSS transition applied when moving elements via keyboard.

  By default, keyboard-driven moves animate with `250ms cubic-bezier(0.25, 1, 0.5, 1)`. You can now customize the `duration` and `easing`, or set the option to `null` to disable the transition entirely.

  ```ts
  Feedback.configure({
    keyboardTransition: {duration: 150, easing: 'ease-out'},
  });
  ```

- [#1919](https://github.com/clauderic/dnd-kit/pull/1919) [`bfff7de`](https://github.com/clauderic/dnd-kit/commit/bfff7de1bf8020e7643adf45ca31c4c08f98501d) Thanks [@clauderic](https://github.com/clauderic)! - The Feedback plugin now supports full CSS `transform` property for compatibility with libraries like react-window v2 that position elements via transforms. Transform-related CSS transitions are filtered out to prevent conflicts with Feedback-managed properties. The ResizeObserver computes shapes from CSS values rather than re-measuring the element, avoiding mid-transition measurement errors. Sortable's `animate()` cancels CSS transitions on transform-related properties before measuring to ensure correct FLIP deltas.

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

- [#1905](https://github.com/clauderic/dnd-kit/pull/1905) [`11ff2eb`](https://github.com/clauderic/dnd-kit/commit/11ff2eb1bc408468b77a29510133b2581b3d3111) Thanks [@clauderic](https://github.com/clauderic)! - Renamed `StyleSheetManager` to `StyleInjector` and centralized CSP `nonce` configuration.

  The `StyleInjector` plugin now accepts a `nonce` option that is applied to all injected `<style>` elements. The `nonce` options have been removed from the `Cursor`, `PreventSelection`, and `Feedback` plugin options.

  Before:

  ```ts
  const manager = new DragDropManager({
    plugins: (defaults) => [
      ...defaults,
      Cursor.configure({nonce: 'abc123'}),
      PreventSelection.configure({nonce: 'abc123'}),
    ],
  });
  ```

  After:

  ```ts
  const manager = new DragDropManager({
    plugins: (defaults) => [
      ...defaults,
      StyleInjector.configure({nonce: 'abc123'}),
    ],
  });
  ```

  The `Cursor` and `PreventSelection` plugins now route their style injection through the `StyleInjector`, so all injected styles respect the centralized `nonce` configuration.

### Patch Changes

- [#1918](https://github.com/clauderic/dnd-kit/pull/1918) [`4bc7e71`](https://github.com/clauderic/dnd-kit/commit/4bc7e7108373b1eb7eef0de832b25ca93ce7bf40) Thanks [@clauderic](https://github.com/clauderic)! - Animation resolution now uses last-wins semantics matching CSS composite order. `getFinalKeyframe` returns the last matching keyframe across all running animations instead of short-circuiting on the first match. `getProjectedTransform` collects the latest value per CSS property (`transform`, `translate`, `scale`) rather than accumulating transforms additively.

- [#1934](https://github.com/clauderic/dnd-kit/pull/1934) [`688e00f`](https://github.com/clauderic/dnd-kit/commit/688e00fffb7535b8027a9c5947d006a875f42d16) Thanks [@clauderic](https://github.com/clauderic)! - Fixed `setPointerCapture` error on touch devices caused by stale pointer activation.

  When a touch was released during the activation delay and followed by a quick re-touch, the pending delay timer from the first touch could fire with a stale `pointerId`, causing `setPointerCapture` to throw. The `PointerSensor` now properly aborts the activation controller during cleanup to cancel pending delay timers, and defensively handles `setPointerCapture` failures.

- [#1916](https://github.com/clauderic/dnd-kit/pull/1916) [`7489265`](https://github.com/clauderic/dnd-kit/commit/74892651b32bc84e2f527a779257d946d923400d) Thanks [@clauderic](https://github.com/clauderic)! - Rewrite `scrollIntoViewIfNeeded` with manual scroll calculations for more predictable behavior in nested scroll containers.

- Updated dependencies [[`cde61e4`](https://github.com/clauderic/dnd-kit/commit/cde61e4b4551f9094f44d9281f65028f85df9813), [`9b24dff`](https://github.com/clauderic/dnd-kit/commit/9b24dffde9a4b58140e5dd8c10e2766dabe42c00), [`8115a57`](https://github.com/clauderic/dnd-kit/commit/8115a57f1191af78dd641933af34c9c37f8dcb3c), [`e69387d`](https://github.com/clauderic/dnd-kit/commit/e69387d2906872310e56ecea4d75f7fa18db4f56), [`4e35963`](https://github.com/clauderic/dnd-kit/commit/4e35963d427d835285a1f10df96899502d327d68)]:
  - @dnd-kit/abstract@0.4.0
  - @dnd-kit/collision@0.4.0
  - @dnd-kit/geometry@0.4.0
  - @dnd-kit/state@0.4.0

## 0.3.2

### Patch Changes

- [#1903](https://github.com/clauderic/dnd-kit/pull/1903) [`7260746`](https://github.com/clauderic/dnd-kit/commit/7260746b0930d51afb3098ef120bffd7d3aaea03) Thanks [@clauderic](https://github.com/clauderic)! - Fixed CSS cascade layer ordering so that the popover-reset styles injected by the Feedback plugin no longer override styles from CSS frameworks that use cascade layers (such as Tailwind CSS v4).

  The `@layer` block is now named `dnd-kit` and injected via a `<style>` element prepended to `<head>` for document roots, ensuring it is declared first in the cascade with the lowest priority. Shadow DOM roots continue to use `adoptedStyleSheets`.

  If needed, consumers can explicitly control the layer ordering:

  ```css
  @layer dnd-kit, base, components, utilities;
  ```

- Updated dependencies []:
  - @dnd-kit/abstract@0.3.2
  - @dnd-kit/collision@0.3.2
  - @dnd-kit/geometry@0.3.2
  - @dnd-kit/state@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [[`4341114`](https://github.com/clauderic/dnd-kit/commit/43411143063349caeded4f778923473624ce25cf)]:
  - @dnd-kit/abstract@0.3.1
  - @dnd-kit/collision@0.3.1
  - @dnd-kit/geometry@0.3.1
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

### Patch Changes

- [`5d64078`](https://github.com/clauderic/dnd-kit/commit/5d640782702b74da8be38cbd1e29271d04781854) Thanks [@clauderic](https://github.com/clauderic)! - Add `dropAnimation` prop to the `DragOverlay` component to allow consumers to disable or customize the drop animation that plays when a drag operation ends. Set to `null` to disable, pass `{duration, easing}` to customize timing, or provide a custom animation function for full control.

- [`863ce2b`](https://github.com/clauderic/dnd-kit/commit/863ce2b74ec0f4d630f4b7036c363bc2e3d04f24) Thanks [@clauderic](https://github.com/clauderic)! - Fix auto-scroll trigger zones and boundaries during pinch-to-zoom.

  Updated `getViewportBoundingRectangle`, `getVisibleBoundingRectangle`, and `getScrollPosition` to use the Visual Viewport API, so that scroll detection and element visibility clipping are based on the actual visible area rather than the layout viewport. This fixes auto-scroll not triggering near the visible edges and stopping before reaching the end of scrollable content when the page is zoomed in.

- [`863ce2b`](https://github.com/clauderic/dnd-kit/commit/863ce2b74ec0f4d630f4b7036c363bc2e3d04f24) Thanks [@clauderic](https://github.com/clauderic)! - Fix drag overlay and debug overlay mispositioning in Safari during pinch-to-zoom.

  Safari anchors `position: fixed` elements to the visual viewport rather than the layout viewport during pinch-to-zoom. Added a `getFixedPositionOffset()` utility that compensates for this by adding `visualViewport.offsetLeft/Top` to the CSS `left`/`top` values of fixed-positioned overlays.

- [`e8ae539`](https://github.com/clauderic/dnd-kit/commit/e8ae539abe05a1df41d45078b108167022ac9ef7) Thanks [@clauderic](https://github.com/clauderic)! - Fix the `move` and `swap` helpers to support computed sortable IDs and optimistic sorting reconciliation for grouped records.

  When the ID-based lookup fails (e.g. when using computed IDs like `id={\`sortable-${item.id}\`}` that don't match data items), the helpers now fall back to sortable index properties (`initialIndex`, `index`, `group`, `initialGroup`) to determine the correct positions. Additionally, grouped records now support optimistic sorting reconciliation—when `source.id === target.id` after optimistic sorting, the helpers use the sortable indices to determine the intended move.

  Added `initialIndex`, `group`, and `initialGroup` getters to `SortableDraggable`, and `index` and `group` getters to `SortableDroppable`, so these properties are accessible from the operation's `source` and `target` in drag events.

- [`41d7e27`](https://github.com/clauderic/dnd-kit/commit/41d7e27edb30cea9940cd5c46c6fcc81f7b401a6) Thanks [@rjur11](https://github.com/rjur11)! - Fixed PointerSensor crash on Android caused by unhandled pointercancel events.

- Updated dependencies [[`6a59647`](https://github.com/clauderic/dnd-kit/commit/6a59647ebba2114b2e423f282ab25bf2ea40318d)]:
  - @dnd-kit/abstract@0.3.0
  - @dnd-kit/collision@0.3.0
  - @dnd-kit/geometry@0.3.0
  - @dnd-kit/state@0.3.0

## 0.2.4

### Patch Changes

- [#1874](https://github.com/clauderic/dnd-kit/pull/1874) [`de27fbc`](https://github.com/clauderic/dnd-kit/commit/de27fbca9df12eece3cd53ccbbac34e0eaf113e1) Thanks [@clauderic](https://github.com/clauderic)! - Expose ergonomic type aliases for drag and drop event handlers: `CollisionEvent`, `BeforeDragStartEvent`, `DragStartEvent`, `DragMoveEvent`, `DragOverEvent`, and `DragEndEvent`. These types are re-exported from `@dnd-kit/dom` and `@dnd-kit/react` for convenience.

- [#1854](https://github.com/clauderic/dnd-kit/pull/1854) [`c2097c9`](https://github.com/clauderic/dnd-kit/commit/c2097c92df0af496e973cea6b9824f82d0aba92e) Thanks [@du33169](https://github.com/du33169)! - Fixed Feedback plugin style injection in Shadow DOM (fix #1765)

- [#1875](https://github.com/clauderic/dnd-kit/pull/1875) [`6d80680`](https://github.com/clauderic/dnd-kit/commit/6d80680454001f42ab9ec4bd7ae3c764ca33287a) Thanks [@clauderic](https://github.com/clauderic)! - **Feedback plugin**: Fix table cell width handling during drag operations. Use `getBoundingClientRect().width` instead of `offsetWidth` for sub-pixel precision, and restore original cell widths after dragging ends instead of leaving hardcoded values permanently.

- [#1877](https://github.com/clauderic/dnd-kit/pull/1877) [`0923bc6`](https://github.com/clauderic/dnd-kit/commit/0923bc674273acffd5cf1c35e24f6ff505acc26e) Thanks [@clauderic](https://github.com/clauderic)! - Respect `prefers-reduced-motion` media query across all animations. When the user prefers reduced motion, the following animations are disabled:

  - Keyboard drag move transitions (250ms translate)
  - Drop animation (250ms slide-back)
  - Sortable item swap transitions (250ms position shift)

- [#1876](https://github.com/clauderic/dnd-kit/pull/1876) [`5f1b19a`](https://github.com/clauderic/dnd-kit/commit/5f1b19a1f39d845618712bb34314c6133030d557) Thanks [@clauderic](https://github.com/clauderic)! - Refactor the Feedback plugin for improved modularity and extensibility.

  **StyleSheetManager** – Introduced a new generic `CorePlugin` that manages CSS stylesheet injection into document and shadow roots. Plugins can call `register(cssRules)` to declare styles and `addRoot(root)` to track additional roots. The manager reactively injects and cleans up adopted stylesheets as the drag operation's source and target roots change. The Feedback plugin now delegates all stylesheet management to the StyleSheetManager.

  **Configurable drop animation** – The `Feedback` plugin now accepts a `dropAnimation` option:

  - Pass `{ duration, easing }` to customize the built-in animation timing
  - Pass a function for full custom animation control (receives context, return a promise)
  - Pass `null` to disable the drop animation entirely
  - Omit for the default 250ms ease animation

  **Extracted helpers** – Observer setup (`createElementMutationObserver`, `createDocumentMutationObserver`, `createResizeObserver`) and the drop animation logic (`runDropAnimation`) are now in dedicated modules within the feedback plugin directory.

- Updated dependencies [[`de27fbc`](https://github.com/clauderic/dnd-kit/commit/de27fbca9df12eece3cd53ccbbac34e0eaf113e1), [`256432d`](https://github.com/clauderic/dnd-kit/commit/256432dec8823342765eebdb78ee791c25fea382), [`be7cfe3`](https://github.com/clauderic/dnd-kit/commit/be7cfe3b6cf6a989aefd3e39fd145fe271942b3a)]:
  - @dnd-kit/abstract@0.2.4
  - @dnd-kit/collision@0.2.4
  - @dnd-kit/geometry@0.2.4
  - @dnd-kit/state@0.2.4

## 0.2.3

### Patch Changes

- [#1861](https://github.com/clauderic/dnd-kit/pull/1861) [`f90571d`](https://github.com/clauderic/dnd-kit/commit/f90571db8b8a94d751d3eeb80d91b6cd34716f47) Thanks [@xuxucode](https://github.com/xuxucode)! - Fixed a bug where custom `PointerSensor` options passed to the `bind()` method were not being respected by the `activationConstraints()` method.

- Updated dependencies []:
  - @dnd-kit/abstract@0.2.3
  - @dnd-kit/collision@0.2.3
  - @dnd-kit/geometry@0.2.3
  - @dnd-kit/state@0.2.3

## 0.2.2

### Patch Changes

- [`5c80bcf`](https://github.com/clauderic/dnd-kit/commit/5c80bcf8affe6accb5b70df3e372f5e864f54b4a) Thanks [@clauderic](https://github.com/clauderic)! - Fixed inverted `preventActivation` default option on `KeyboardSensor`

- Updated dependencies []:
  - @dnd-kit/abstract@0.2.2
  - @dnd-kit/collision@0.2.2
  - @dnd-kit/geometry@0.2.2
  - @dnd-kit/state@0.2.2

## 0.2.1

### Patch Changes

- [`d7f4130`](https://github.com/clauderic/dnd-kit/commit/d7f413079b028feb826ca33243927e855619c0f2) Thanks [@clauderic](https://github.com/clauderic)! - - Fix a bug with `PointerSensor.defaults.preventActivation` not being applied if there are other sensor options provided.

- Updated dependencies []:
  - @dnd-kit/abstract@0.2.1
  - @dnd-kit/collision@0.2.1
  - @dnd-kit/geometry@0.2.1
  - @dnd-kit/state@0.2.1

## 0.2.0

### Minor Changes

- [#1821](https://github.com/clauderic/dnd-kit/pull/1821) [`e95a9c8`](https://github.com/clauderic/dnd-kit/commit/e95a9c8f448d6b339e0b6fd37546ac7cfdf18edb) Thanks [@clauderic](https://github.com/clauderic)! - - Refactor `PointerSensor` to use the new activation primitives.

  - Add `PointerActivationConstraints` with composable constraints:
    - `PointerActivationConstraints.Delay({value, tolerance})`
    - `PointerActivationConstraints.Distance({value, tolerance?})`
  - Update `PointerSensor.defaults.activationConstraints(...)`:
    - Mouse on handle: activates immediately.
    - Touch: Delay 250ms with 5px tolerance.
    - Text inputs: Delay 200ms with 0px tolerance.
    - Other pointer types: Delay 200ms with 10px tolerance + Distance 5px.
  - New utilities:
    - `getDocuments()` returns all same-origin documents (enables listening across iframes).
    - `getEventCoordinates(event)` returns `{x, y}` from a `PointerEvent`.
  - `PointerSensor` now binds listeners across same-origin documents and improves default prevention during drag.
  - Internal cleanups: remove internal `sensors/pointer/index.ts` and `utilities/execution-context/index.ts` (no public API impact).

  These changes are additive and should be non-breaking. If you were composing pointer activation constraints, migrate to the new `PointerActivationConstraints` classes if you were importing internal implementations.

- [#1823](https://github.com/clauderic/dnd-kit/pull/1823) [`9849887`](https://github.com/clauderic/dnd-kit/commit/984988774a6ff2f19cae4a27612bbd50cfcfa574) Thanks [@github-actions](https://github.com/apps/github-actions)! - - Add `preventActivation` option to `PointerSensor` and `KeyboardSensor` to conditionally prevent sensor activation.
  - **PointerSensor**: The default `preventActivation` prevents activation when the pointer target is an interactive element (input, select, textarea, button, link, or contenteditable) that is not the source element or handle.
  - **KeyboardSensor**: Renamed `shouldActivate` to `preventActivation` with inverted logic—return `true` to prevent activation instead of returning `true` to allow it.
  - New utility: `isInteractiveElement(element)` checks if an element is an interactive form control or link.

### Patch Changes

- Updated dependencies [[`e95a9c8`](https://github.com/clauderic/dnd-kit/commit/e95a9c8f448d6b339e0b6fd37546ac7cfdf18edb)]:
  - @dnd-kit/abstract@0.2.0
  - @dnd-kit/collision@0.2.0
  - @dnd-kit/geometry@0.2.0
  - @dnd-kit/state@0.2.0

## 0.1.21

### Patch Changes

- [#1775](https://github.com/clauderic/dnd-kit/pull/1775) [`3d6219d`](https://github.com/clauderic/dnd-kit/commit/3d6219db072551945556fdac2788e738f77b92c7) Thanks [@fpronto](https://github.com/fpronto)! - Added nonce as an option for every plugin that inject styles in html

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.21
  - @dnd-kit/collision@0.1.21
  - @dnd-kit/geometry@0.1.21
  - @dnd-kit/state@0.1.21

## 0.1.20

### Patch Changes

- [#1737](https://github.com/clauderic/dnd-kit/pull/1737) [`3ba5a90`](https://github.com/clauderic/dnd-kit/commit/3ba5a90854669e034a06146fc0268ed0de813257) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Sortable**: Fix bugs with reverting optimistic updates on canceled `dragend`

- [#1737](https://github.com/clauderic/dnd-kit/pull/1737) [`32448ff`](https://github.com/clauderic/dnd-kit/commit/32448ff11eb3e86a28fc8f6ef7a8a3761e092412) Thanks [@github-actions](https://github.com/apps/github-actions)! - Bump `@preact/signals-core` to `1.10.0`

- Updated dependencies [[`98d4cd4`](https://github.com/clauderic/dnd-kit/commit/98d4cd4047c56589cdf21067526426717bba01c4), [`32448ff`](https://github.com/clauderic/dnd-kit/commit/32448ff11eb3e86a28fc8f6ef7a8a3761e092412)]:
  - @dnd-kit/state@0.1.20
  - @dnd-kit/abstract@0.1.20
  - @dnd-kit/collision@0.1.20
  - @dnd-kit/geometry@0.1.20

## 0.1.19

### Patch Changes

- [#1735](https://github.com/clauderic/dnd-kit/pull/1735) [`cc7feac`](https://github.com/clauderic/dnd-kit/commit/cc7feacb003b95a744c81e7c75c2aa26d071971f) Thanks [@MateusJabour](https://github.com/MateusJabour)! - Fixes cleanup issue where user would be stuck in dragging mode

- Updated dependencies [[`d848327`](https://github.com/clauderic/dnd-kit/commit/d848327b242c6714b36207071ad30e6b4183e865)]:
  - @dnd-kit/state@0.1.19
  - @dnd-kit/abstract@0.1.19
  - @dnd-kit/collision@0.1.19
  - @dnd-kit/geometry@0.1.19

## 0.1.18

### Patch Changes

- [#1715](https://github.com/clauderic/dnd-kit/pull/1715) [`e502979`](https://github.com/clauderic/dnd-kit/commit/e502979375b9211fef277b8d657d9411f84be96c) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improved TypeScript generics for better type safety and flexibility

  - Enhanced `DragDropManager` to accept generic type parameters with proper constraints, allowing for more flexible type usage while maintaining type safety
  - Updated `DragDropProvider` to support custom generic types for draggable and droppable entities
  - Modified React hooks (`useDragDropManager`, `useDragDropMonitor`, `useDragOperation`) to properly infer and return the correct generic types
  - Changed from concrete `Draggable` and `Droppable` types to generic parameters constrained by `Data` type

- [`88942be`](https://github.com/clauderic/dnd-kit/commit/88942be007a743673644ba531fd5c6b1a501bf2e) Thanks [@clauderic](https://github.com/clauderic)! - **DOMRectangle**: Fix bugs with projected transforms.

- [#1715](https://github.com/clauderic/dnd-kit/pull/1715) [`9326d43`](https://github.com/clauderic/dnd-kit/commit/9326d43ba0b9b682ee377011b96d4713711571a5) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Re-inject the feedback styles if they get removed from the DOM before the `Feedback` plugin is torn down.

- [#1715](https://github.com/clauderic/dnd-kit/pull/1715) [`7af261f`](https://github.com/clauderic/dnd-kit/commit/7af261f4e3214a9ebef46d26df607221306eb697) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Fix an issue that caused styles to be removed when another instance of the Feedback plugin was torn down even if other instances of the Feedback plugin are still active.

- [#1714](https://github.com/clauderic/dnd-kit/pull/1714) [`b9b182e`](https://github.com/clauderic/dnd-kit/commit/b9b182ef39f7aa8bfe2d331cb20c696b1e9fc15a) Thanks [@clauderic](https://github.com/clauderic)! - **OptimisticSortingPlugin**: Fixed a bug where using `queueMicrotask` in the `dragover` event of to check if `event.defaultPrevented()` was called by consumers was causing the order that we capture to be stale in the event that the consumer updates the order of sortable items before the micortask runs, which can happen in React for consumers using `useOptimistic` to update state optimistically.

- [#1715](https://github.com/clauderic/dnd-kit/pull/1715) [`bb790c9`](https://github.com/clauderic/dnd-kit/commit/bb790c928a9955bd5c7c4312875090e16d891c23) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Fix a regression with the drop animation on Safari.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.18
  - @dnd-kit/collision@0.1.18
  - @dnd-kit/geometry@0.1.18
  - @dnd-kit/state@0.1.18

## 0.1.17

### Patch Changes

- [`cfb94d4`](https://github.com/clauderic/dnd-kit/commit/cfb94d4fef372059cb87cf0e63bc3ab87f5c8bd8) Thanks [@clauderic](https://github.com/clauderic)! - Added a `try` / `catch` in `showPopover` and `hidePopover` as the `element.matches(':popover-open')` selector can throw in browsers that don't support the Popover API.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.17
  - @dnd-kit/collision@0.1.17
  - @dnd-kit/geometry@0.1.17
  - @dnd-kit/state@0.1.17

## 0.1.16

### Patch Changes

- [#1712](https://github.com/clauderic/dnd-kit/pull/1712) [`93911cc`](https://github.com/clauderic/dnd-kit/commit/93911cca237bea302a12749476d4e18b74ac0fa2) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Debug**: Force the source debug elements to be re-promoted to the top of the top layer.

- [#1712](https://github.com/clauderic/dnd-kit/pull/1712) [`0f68bb6`](https://github.com/clauderic/dnd-kit/commit/0f68bb6c95b1287d5988b1d5d4e94f1462fc36a5) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Account for frame scale when optimistically updating feedback element shape while dragging.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.16
  - @dnd-kit/collision@0.1.16
  - @dnd-kit/geometry@0.1.16
  - @dnd-kit/state@0.1.16

## 0.1.15

### Patch Changes

- [`5539a5a`](https://github.com/clauderic/dnd-kit/commit/5539a5a2991ac86b217dba3ef70fc06331bd0260) Thanks [@clauderic](https://github.com/clauderic)! - Mock `ResizeObserver` in SSR environment.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.15
  - @dnd-kit/collision@0.1.15
  - @dnd-kit/geometry@0.1.15
  - @dnd-kit/state@0.1.15

## 0.1.14

### Patch Changes

- [#1708](https://github.com/clauderic/dnd-kit/pull/1708) [`4c1e05d`](https://github.com/clauderic/dnd-kit/commit/4c1e05d531a1ffbf32b27d997ebd504532b9616a) Thanks [@GuillaumeSalles](https://github.com/GuillaumeSalles)! - Ensure PositionObserver recompute element rect if IntersectionObserver is scheduled in a different frame

- [#1707](https://github.com/clauderic/dnd-kit/pull/1707) [`a97b10c`](https://github.com/clauderic/dnd-kit/commit/a97b10c9d8467c14ef678d3776ea10a2a1e6e027) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**:

  - Fixed a bug where the initial `translate` string was incorrectly formed, causing it not to be applied.
  - Fixed a bug with the placeholder ResizeObserver shape update
  - Fixed a bug with the initial shape of the Feedback element when the source element unmounts and re-mounts during a drag operation
  - Fixed a bug with the initial `transition` when setting up the Feedback element

- [#1707](https://github.com/clauderic/dnd-kit/pull/1707) [`caa3273`](https://github.com/clauderic/dnd-kit/commit/caa3273af1fcee9b4e3b5f1e80e5573c84ab69e3) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PositionObserver**: Fixed a bug with observing elements contained within same origin iframes. Due to limitations with `IntersectionObserver`, we need to also attach position observers on the containing iframe to ensure the position of elements nested withing the iframe is updated if the iframe position changes.

- [#1707](https://github.com/clauderic/dnd-kit/pull/1707) [`cb47da3`](https://github.com/clauderic/dnd-kit/commit/cb47da3dad7ec617fabb6e8c3b3432a19b354812) Thanks [@github-actions](https://github.com/apps/github-actions)! - **DOMRectangle**: Fixed a bug with projected transforms where scale was not properly being taken into account.

- [#1707](https://github.com/clauderic/dnd-kit/pull/1707) [`f295344`](https://github.com/clauderic/dnd-kit/commit/f2953444cbdb195e169fc615454d6be3170bf2a6) Thanks [@github-actions](https://github.com/apps/github-actions)! - **KeyboardSensor**: Delegated the responsibility of ending the drag operation when the window resizes to the Feedback plugin, as we only need to end the operation if the feedback element's window resizes, which can be different from the source element window.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.14
  - @dnd-kit/collision@0.1.14
  - @dnd-kit/geometry@0.1.14
  - @dnd-kit/state@0.1.14

## 0.1.13

### Patch Changes

- [`c46415a`](https://github.com/clauderic/dnd-kit/commit/c46415a0733f5cbba49cdbd7b6786a0d9add6800) Thanks [@clauderic](https://github.com/clauderic)! - **Feedback**: Removed `box-sizing: border-box` from the default Feedback plugin styles, and account for `box-sizing: content-box` or `box-sizing: border-box` when setting an explicit wdith and height on the feedback element.

- [#1691](https://github.com/clauderic/dnd-kit/pull/1691) [`382f4e2`](https://github.com/clauderic/dnd-kit/commit/382f4e2f0800a3b85487a1a7a2cefef4484bee70) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Accessiblity**: Fixed a bug where accesibility instructions and announcement nodes were re-created on every drag operation.

- [#1691](https://github.com/clauderic/dnd-kit/pull/1691) [`432a0dd`](https://github.com/clauderic/dnd-kit/commit/432a0dd8c67cfdebf0194205979b7249620e73a8) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Fix a bug where options were not properly being set on the plugin instance.

- [#1689](https://github.com/clauderic/dnd-kit/pull/1689) [`a3496c1`](https://github.com/clauderic/dnd-kit/commit/a3496c15c2dc07cc982608b2a4afb1c61b01dbb8) Thanks [@GuillaumeSalles](https://github.com/GuillaumeSalles)! - Ensure showPopover is not called when popover is already visible

- [#1691](https://github.com/clauderic/dnd-kit/pull/1691) [`4a22b39`](https://github.com/clauderic/dnd-kit/commit/4a22b39267f1fa8d17a62b9c29ff8728733c1478) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**: Update default activation constraints to only allow dragging via the `delay` constraint when the activation event target is a text input to avoid interfering with potential text selections within the text input.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.13
  - @dnd-kit/collision@0.1.13
  - @dnd-kit/geometry@0.1.13
  - @dnd-kit/state@0.1.13

## 0.1.12

### Patch Changes

- [`2e0e2e2`](https://github.com/clauderic/dnd-kit/commit/2e0e2e256d2043831df6a245df9f618ac4b5ecc9) Thanks [@clauderic](https://github.com/clauderic)! - Exported `Cursor` and `PreventSelection` plugins which are used in the default preset.

- [#1687](https://github.com/clauderic/dnd-kit/pull/1687) [`b86867b`](https://github.com/clauderic/dnd-kit/commit/b86867b1426525729357654a62f52fe0554f7f73) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `visibility: hidden` to the `::backdrop` pseudo element of the `Feedback` plugin to ensure it is not visible on Firefox, there is a bug where it can be shown even with `display: none` when there is a backdrop filter applied to it.

- [#1687](https://github.com/clauderic/dnd-kit/pull/1687) [`a913f5e`](https://github.com/clauderic/dnd-kit/commit/a913f5e68435c5c0a4a073a7437f265bcc0b5d1d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix calls to `requestAnimationFrame` scheduler in SSR environment

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.12
  - @dnd-kit/collision@0.1.12
  - @dnd-kit/geometry@0.1.12
  - @dnd-kit/state@0.1.12

## 0.1.11

### Patch Changes

- [#1685](https://github.com/clauderic/dnd-kit/pull/1685) [`2370665`](https://github.com/clauderic/dnd-kit/commit/237066598f7da6cd59d78120260788593371e820) Thanks [@clauderic](https://github.com/clauderic)! - Minimize layout thrashing in `Scroller` and `Accessibility` plugins.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.11
  - @dnd-kit/collision@0.1.11
  - @dnd-kit/geometry@0.1.11
  - @dnd-kit/state@0.1.11

## 0.1.10

### Patch Changes

- [`a0f5c44`](https://github.com/clauderic/dnd-kit/commit/a0f5c44985b634e8044415db342354493d201f3e) Thanks [@clauderic](https://github.com/clauderic)! - **Feedback**: Optimistically update `dragOperation.shape` when there are no modifiers for better performance.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.10
  - @dnd-kit/collision@0.1.10
  - @dnd-kit/geometry@0.1.10
  - @dnd-kit/state@0.1.10

## 0.1.9

### Patch Changes

- [`ffdbf52`](https://github.com/clauderic/dnd-kit/commit/ffdbf52a93cbe0c1c785feca57622d4712175a3a) Thanks [@clauderic](https://github.com/clauderic)! - **Feedback**: Revert moving CSS variables to the root as we noticed performance regressions in applications that have complex DOM structures.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.9
  - @dnd-kit/collision@0.1.9
  - @dnd-kit/geometry@0.1.9
  - @dnd-kit/state@0.1.9

## 0.1.8

### Patch Changes

- [#1681](https://github.com/clauderic/dnd-kit/pull/1681) [`14dc059`](https://github.com/clauderic/dnd-kit/commit/14dc05950ad31c50240ee864431112d7f1b70da0) Thanks [@github-actions](https://github.com/apps/github-actions)! - Cache repeated calls to `getComputedStyles` when reading properties that are unlikely to change frequently.

- [`fcd9bb5`](https://github.com/clauderic/dnd-kit/commit/fcd9bb56fafc5ec23ded219bfcd7fdfa31a0caff) Thanks [@clauderic](https://github.com/clauderic)! - Moved the CSS variables to the `[data-dnd-root]` element, which defaults to the `document.body` of the source element to avoid triggering `MutationObserver` callbacks every time the `--dnd-translate` CSS variable is updated.

- [#1681](https://github.com/clauderic/dnd-kit/pull/1681) [`93d3c7c`](https://github.com/clauderic/dnd-kit/commit/93d3c7c8b01d640b017cf8d2cddc69cc47c74ca5) Thanks [@github-actions](https://github.com/apps/github-actions)! - Replace `innerText` with `textContent` for better performance across multiple plugins. This change improves performance since `textContent` is generally more efficient than `innerText` as it doesn't trigger layout reflows and doesn't parse HTML entities.

- [`3c625d6`](https://github.com/clauderic/dnd-kit/commit/3c625d61fc8bdba026d445333c2d1ca1d8489294) Thanks [@clauderic](https://github.com/clauderic)! - Do not use cache when getting element animations to compute projected transforms.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.8
  - @dnd-kit/collision@0.1.8
  - @dnd-kit/geometry@0.1.8
  - @dnd-kit/state@0.1.8

## 0.1.7

### Patch Changes

- [`0618852`](https://github.com/clauderic/dnd-kit/commit/0618852fdeb6948e85d1330febee73e48458e740) Thanks [@clauderic](https://github.com/clauderic)! - Fix a regression with horizontal auto-scrolling.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.7
  - @dnd-kit/collision@0.1.7
  - @dnd-kit/geometry@0.1.7
  - @dnd-kit/state@0.1.7

## 0.1.6

### Patch Changes

- [#1671](https://github.com/clauderic/dnd-kit/pull/1671) [`4f49d1b`](https://github.com/clauderic/dnd-kit/commit/4f49d1b1de317adaa05cc0b7adacbaffda4fd8c2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improve animation handling and scheduling

  - Refactor Scheduler to be more flexible and generic
  - Cache successive document.getAnimations() calls
  - Fix bugs in Safari when projecting animations in DOMRectangle
  - Fix animation handling in Feedback and Sortable components

- [#1672](https://github.com/clauderic/dnd-kit/pull/1672) [`b18115f`](https://github.com/clauderic/dnd-kit/commit/b18115f4b19c45c76c827921b25e47aad16c91ce) Thanks [@GuillaumeSalles](https://github.com/GuillaumeSalles)! - Improve Feedback clone performance by avoiding innerHtml reset on every mutation

- [#1671](https://github.com/clauderic/dnd-kit/pull/1671) [`ac13c92`](https://github.com/clauderic/dnd-kit/commit/ac13c9298cc8b4eb680039cf17fb10582ab8d023) Thanks [@github-actions](https://github.com/apps/github-actions)! - Optimize pointer move handling in PointerSensor by using the rAF scheduler to batch move events.

- Updated dependencies [[`7ceb799`](https://github.com/clauderic/dnd-kit/commit/7ceb799c7d214bc8223ec845357a0040c28ae40e), [`299389b`](https://github.com/clauderic/dnd-kit/commit/299389befcc747fe8d79231ba32f73afae88615e)]:
  - @dnd-kit/abstract@0.1.6
  - @dnd-kit/state@0.1.6
  - @dnd-kit/collision@0.1.6
  - @dnd-kit/geometry@0.1.6

## 0.1.5

### Patch Changes

- [#1669](https://github.com/clauderic/dnd-kit/pull/1669) [`8fecc41`](https://github.com/clauderic/dnd-kit/commit/8fecc416fb8503fcb555563a44246cd177677b4e) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**: Add support for multiple activator elements via `activatorElements` option to configure multiple elements that can trigger drag operations.

- [#1669](https://github.com/clauderic/dnd-kit/pull/1669) [`a9c17df`](https://github.com/clauderic/dnd-kit/commit/a9c17df386697dc3236f3ba1b7e319cdf4c5a706) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix `Feedback` drop animation in Safari by always requesting an animation frame before performing the drop animation.

- [#1669](https://github.com/clauderic/dnd-kit/pull/1669) [`f31589a`](https://github.com/clauderic/dnd-kit/commit/f31589ae579f1ce574207d44e4016e30b82549e9) Thanks [@github-actions](https://github.com/apps/github-actions)! - **KeyboardSensor**: Improve configuration options

  - Add configurable offset for keyboard movements (number or {x, y})
  - Add static `defaults` and `configure` properties for better configuration
  - Support different x and y offset values for `offset`

- [#1669](https://github.com/clauderic/dnd-kit/pull/1669) [`616db17`](https://github.com/clauderic/dnd-kit/commit/616db17cdded5974febf69718337db0604c613fc) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor PointerSensor configuration:

  - Partially configuring the pointer sensor no longer overrides other defaults. If you wish to override all defaults, you must explicitly set each option.
  - Moved default pointer sensor configuration into to PointerSensor class.
  - Add static `defaults` property to PointerSensor class for easier configuration and extension.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.5
  - @dnd-kit/collision@0.1.5
  - @dnd-kit/geometry@0.1.5
  - @dnd-kit/state@0.1.5

## 0.1.4

### Patch Changes

- [`b1d798d`](https://github.com/clauderic/dnd-kit/commit/b1d798d9454bf1d4c47c4e13d11bfd092bdc668b) Thanks [@clauderic](https://github.com/clauderic)! - Fixed regressions with keyboard sorting.

- Updated dependencies []:
  - @dnd-kit/abstract@0.1.4
  - @dnd-kit/collision@0.1.4
  - @dnd-kit/geometry@0.1.4
  - @dnd-kit/state@0.1.4

## 0.1.3

### Patch Changes

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`6c9a9ea`](https://github.com/clauderic/dnd-kit/commit/6c9a9ea060095884c90c72cd5d6b73820467ec29) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**: Fixed a bug where `actions.stop()` would not be invoked if the drag operation had not finished initializing.

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`79c6519`](https://github.com/clauderic/dnd-kit/commit/79c65195483bee3909177c1b46d1c1073dd2c765) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix tracking of initial index and group for `Sortable` instances that unmount and re-mount during a drag operation.

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`52c1ba3`](https://github.com/clauderic/dnd-kit/commit/52c1ba3924be32a9c856d74a3e5221fd05fd91c1) Thanks [@github-actions](https://github.com/apps/github-actions)! - Implement default renderer for DOM using `requestAnimationFrame` to ensure the browser has time to render animation frames.

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`1bef872`](https://github.com/clauderic/dnd-kit/commit/1bef8722d515079f998dc0608084e1d853e74d3a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improve drag operation control by:

  - Introducing `AbortController` for better operation lifecycle management
  - Remove `requestAnimationFram()` from `start()` action
  - Replacing boolean returns with proper abort control
  - Ensure proper cleanup of drag operations
  - Improving status handling and initialization checks
  - Making feedback plugin respect operation initialization state

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`9a0edf6`](https://github.com/clauderic/dnd-kit/commit/9a0edf64cbde1bd761f3650e043b6612e61a5fab) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor Sortable store implementation to use a new `WeakStore` class

  - Add new `WeakStore` constructor in `@dnd-kit/state` package
  - Replace Map-based store implementation in Sortable with new WeakStore utility

- [#1663](https://github.com/clauderic/dnd-kit/pull/1663) [`18a7998`](https://github.com/clauderic/dnd-kit/commit/18a7998858e6504f0e3c6f613bd174eb9f68e553) Thanks [@github-actions](https://github.com/apps/github-actions)! - Removed unnecessary microtask in Sortable animation logic when index changes

- Updated dependencies [[`8f91d91`](https://github.com/clauderic/dnd-kit/commit/8f91d9112608d2077c3b6c8fc939aa052606148c), [`6c9a9ea`](https://github.com/clauderic/dnd-kit/commit/6c9a9ea060095884c90c72cd5d6b73820467ec29), [`1bef872`](https://github.com/clauderic/dnd-kit/commit/1bef8722d515079f998dc0608084e1d853e74d3a), [`2522836`](https://github.com/clauderic/dnd-kit/commit/2522836fdb80520913ea35d94c6558bf7784afc9), [`9a0edf6`](https://github.com/clauderic/dnd-kit/commit/9a0edf64cbde1bd761f3650e043b6612e61a5fab), [`a9db4c7`](https://github.com/clauderic/dnd-kit/commit/a9db4c73467d9eda9f95fe5b582948c9fc735f57)]:
  - @dnd-kit/state@0.1.3
  - @dnd-kit/abstract@0.1.3
  - @dnd-kit/geometry@0.1.3
  - @dnd-kit/collision@0.1.3

## 0.1.2

### Patch Changes

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`4682570`](https://github.com/clauderic/dnd-kit/commit/4682570a6b80868af0e51b1bbbf902430117df43) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix handling of aborted drag operations across sensors. The `start` method now returns a boolean to indicate whether the operation was aborted, allowing sensors to properly clean up when a drag operation is prevented. This affects the Keyboard and Pointer sensors, ensuring they properly handle cases where `beforeDragStart` events are prevented.

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`f8d69b0`](https://github.com/clauderic/dnd-kit/commit/f8d69b01f4cf53fc368ef1fca9188c313192928d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow `actions.start()` to optionally receive a `source` as input.

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor the drag operation system to improve code organization and maintainability:

  - Split `dragOperation.ts` into multiple focused files:
    - `operation.ts` - Core drag operation logic
    - `status.ts` - Status management
    - `actions.ts` - Drag actions
  - Update imports and exports to reflect new file structure
  - Improve type definitions and exports

- [#1660](https://github.com/clauderic/dnd-kit/pull/1660) [`374f81f`](https://github.com/clauderic/dnd-kit/commit/374f81f84c9401729e2e0ee48520c647a48e5afd) Thanks [@GuillaumeSalles](https://github.com/GuillaumeSalles)! - Add option `shouldActivate` on `KeyboardSensor`. By default `KeyboardSensor` activates if the Keyboard event is triggered from the `Draggable` `element` or `handle`. `shouldActivate` let the user override this behavior.

- Updated dependencies [[`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a), [`4682570`](https://github.com/clauderic/dnd-kit/commit/4682570a6b80868af0e51b1bbbf902430117df43), [`f8d69b0`](https://github.com/clauderic/dnd-kit/commit/f8d69b01f4cf53fc368ef1fca9188c313192928d), [`d04e9a2`](https://github.com/clauderic/dnd-kit/commit/d04e9a2879fb00f092c3f8280c8081a48eebf193), [`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a)]:
  - @dnd-kit/state@0.1.2
  - @dnd-kit/geometry@0.1.2
  - @dnd-kit/abstract@0.1.2
  - @dnd-kit/collision@0.1.2

## 0.1.1

### Patch Changes

- [#1656](https://github.com/clauderic/dnd-kit/pull/1656) [`569b6e3`](https://github.com/clauderic/dnd-kit/commit/569b6e3a1d3b199328f7a2362a10b446e657726f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Export `SortableKeyboardPlugin` and `OptimisticSortingPlugin` from the sortable module to allow consumers to customize their sortable plugin configurations.

- [#1655](https://github.com/clauderic/dnd-kit/pull/1655) [`a176848`](https://github.com/clauderic/dnd-kit/commit/a1768481e3f7dc4d1176a7fcb363acd020f2c46c) Thanks [@blancham](https://github.com/blancham)! - Fixed a bug where auto-scroll does not wotk with inverted element

- Updated dependencies [[`f13cbc9`](https://github.com/clauderic/dnd-kit/commit/f13cbc978229844770d3c8aa03135e4352ee2532)]:
  - @dnd-kit/abstract@0.1.1
  - @dnd-kit/collision@0.1.1
  - @dnd-kit/geometry@0.1.1
  - @dnd-kit/state@0.1.1

## 0.1.0

### Patch Changes

- [#1645](https://github.com/clauderic/dnd-kit/pull/1645) [`043c280`](https://github.com/clauderic/dnd-kit/commit/043c2807a7aa290ce9838a638422245b0bd89cf1) Thanks [@clauderic](https://github.com/clauderic)! - Add fallback logic to type-guards when instance checks fail to identify instances, for example to test if an element is an `Element` or `HTMLElement` or `SVGElement`, or if an `AnimationEffect` is a `KeyframeEffect`.

- [#1644](https://github.com/clauderic/dnd-kit/pull/1644) [`ee40aac`](https://github.com/clauderic/dnd-kit/commit/ee40aacda6c015b1f357182c461650fde4c6704e) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Use `revert` instead of `unset` to reset styles applied by the `popover` attribute.

- [#1643](https://github.com/clauderic/dnd-kit/pull/1643) [`635d94f`](https://github.com/clauderic/dnd-kit/commit/635d94f6e719bcdf50e0024b6d1f09b9bb46c8a5) Thanks [@clauderic](https://github.com/clauderic)! - Fix a bug in the `Scroller` plugin that would always use `document.getElementFromPoint` instead of the document of the source element.

- [#1644](https://github.com/clauderic/dnd-kit/pull/1644) [`0235cef`](https://github.com/clauderic/dnd-kit/commit/0235cefcf4942c86189e81fde4dc8f19ad420517) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Cursor**: Ensure styles for Cursor plugin are added to the document of the draggable source element.

- [#1644](https://github.com/clauderic/dnd-kit/pull/1644) [`1ba8700`](https://github.com/clauderic/dnd-kit/commit/1ba8700fd03f3fdc8f4fabe90befbc8fd54d99f5) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug in the `getDocument` helper to make it work with SVG elements.

- [#1644](https://github.com/clauderic/dnd-kit/pull/1644) [`3080d2c`](https://github.com/clauderic/dnd-kit/commit/3080d2c8c122beabc41fb8d79beceb2188a01947) Thanks [@github-actions](https://github.com/apps/github-actions)! - **Feedback**: Set `popover` attribute value to `manual`.

- Updated dependencies [[`00a33c9`](https://github.com/clauderic/dnd-kit/commit/00a33c99e777ab205a45309a4efc8b3560bafdaf)]:
  - @dnd-kit/abstract@0.1.0
  - @dnd-kit/collision@0.1.0
  - @dnd-kit/geometry@0.1.0
  - @dnd-kit/state@0.1.0

## 0.0.10

### Patch Changes

- [#1606](https://github.com/clauderic/dnd-kit/pull/1606) [`2c53eb9`](https://github.com/clauderic/dnd-kit/commit/2c53eb95a980d143b179af5b7f0a071cdedd9089) Thanks [@github-actions](https://github.com/apps/github-actions)! - Use the `draggable.isDragging` property instead of `draggable.isDragSource` to set `aria-grabbing` and `aria-pressed` attributes.

- [#1606](https://github.com/clauderic/dnd-kit/pull/1606) [`3155941`](https://github.com/clauderic/dnd-kit/commit/3155941608dbf16ed867e931381e7bb2c65a126d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug with the `Feedback` plugin where the placeholder element was visible for a brief moment during the drop animation instead of being hidden until the animation completes.

- [#1606](https://github.com/clauderic/dnd-kit/pull/1606) [`082836e`](https://github.com/clauderic/dnd-kit/commit/082836e517252262b7984b142093ba6c81c43ba8) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug with the `PointerSensor` where it was possible for it to activate while a drag operation was already in progress.

- Updated dependencies []:
  - @dnd-kit/abstract@0.0.10
  - @dnd-kit/collision@0.0.10
  - @dnd-kit/geometry@0.0.10
  - @dnd-kit/state@0.0.10

## 0.0.9

### Patch Changes

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`e36d954`](https://github.com/clauderic/dnd-kit/commit/e36d95420148659ba78bdbefd3a0a24ec5d02b8f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `nativeEvent` property to `dragstart`, `dragmove` and `dragend` events. This can be used to distinguish user triggered events from sensor triggered events, as user or plugin triggered events will typically not have an associated `event` attached.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`bb4abcd`](https://github.com/clauderic/dnd-kit/commit/bb4abcd1957f2562072059ad8b5e701893a0fede) Thanks [@github-actions](https://github.com/apps/github-actions)! - Make sure the Feedback element is promoted to the top layer when synchronizing the placeholder and element position in the DOM.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`d86bbc7`](https://github.com/clauderic/dnd-kit/commit/d86bbc7e73ba16296c48f9af29f1893624157a0f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `alignment` configuration option to draggable instances to let consumers decide how to align the draggable during the drop animation and while keyboard sorting. Defaults to the center of the target shape.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`f433fb2`](https://github.com/clauderic/dnd-kit/commit/f433fb21aa76c5b4badeec6423e3c930006c8d70) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a regression in the `Feedback` plugin where the initial `translate` style applied to the element being dragged was not properly accounted for anymore.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`7dc0103`](https://github.com/clauderic/dnd-kit/commit/7dc0103c5e5281e9ee61bcd9c3ab493fc9307073) Thanks [@github-actions](https://github.com/apps/github-actions)! - Removed some `!important` rules and updated the specificity of the `Feedback` plugin styles to `0-2-0` to make it easier for consumers to override certain styles, such as `width` and `height`.

- [`cff3c3c`](https://github.com/clauderic/dnd-kit/commit/cff3c3cbbe96a6f401cb3900a8cd5f727a974c2d) Thanks [@clauderic](https://github.com/clauderic)! - Fixed a bug with the drop animation by using `intrinsicWidth` and `intrinsicHeight` to determine if the width and height of the source and target differ or not rather than the `width` and `height` properties which may be transformed.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`f87d633`](https://github.com/clauderic/dnd-kit/commit/f87d63347529f5c9600bcffb14ad2d15ff6eb107) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a regression introduced in `0.0.7` with optimistic updates not being persisted on drag end.

- [`860759b`](https://github.com/clauderic/dnd-kit/commit/860759b15167616c465eef1738fd02c76aa53cb3) Thanks [@clauderic](https://github.com/clauderic)! - Added `intrinsicWidth` and `intrinsicHeight` properties on `DOMRectangle`, which return the intrinsic width and height of an element, before any transforms are applied.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`54e416f`](https://github.com/clauderic/dnd-kit/commit/54e416f6f0aaa19c11827f80b2df796bfe237ba0) Thanks [@github-actions](https://github.com/apps/github-actions)! - Only handle `dragmove` events that have an associated `KeyboardEvent` as their `event.nativeEvent` property.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`c51778d`](https://github.com/clauderic/dnd-kit/commit/c51778dde5bcd614b1891c5f7659130769ddc9f8) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**: Use `capture` listener to prevent `dragstart` events.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`86ed6c8`](https://github.com/clauderic/dnd-kit/commit/86ed6c8e203bb167d451c36605c2a0e0d33f0157) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a regression in the `PointerSensor` where the same drag operation could fire a dragend event twice due to a race condition between `pointerup` and `lostpointercapture`.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`afedea9`](https://github.com/clauderic/dnd-kit/commit/afedea930bbfd1ea546c2bcbe5f42a3ea8b913fe) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PreventSelection**: Remove text selection when a drag operation is initialized.

- Updated dependencies [[`e36d954`](https://github.com/clauderic/dnd-kit/commit/e36d95420148659ba78bdbefd3a0a24ec5d02b8f), [`60e7297`](https://github.com/clauderic/dnd-kit/commit/60e72979850bfe4cbb8e2b2e2b8e84bce9edc9f5), [`3463da1`](https://github.com/clauderic/dnd-kit/commit/3463da1cac9f26e4b2ab3278ae52206bb99645e4), [`b7f1cf8`](https://github.com/clauderic/dnd-kit/commit/b7f1cf8f9e15a285c45f896e092f61001335cdff), [`3e629cc`](https://github.com/clauderic/dnd-kit/commit/3e629cc81dbaf9d112c4f1d2c10c75eb6779cf4e), [`8ae7014`](https://github.com/clauderic/dnd-kit/commit/8ae70143bc404bff7678fa8e8390a640c16f2579), [`ce31da7`](https://github.com/clauderic/dnd-kit/commit/ce31da736ec5d4f48bab45430be7b57223d60ee7)]:
  - @dnd-kit/abstract@0.0.9
  - @dnd-kit/geometry@0.0.9
  - @dnd-kit/collision@0.0.9
  - @dnd-kit/state@0.0.9

## 0.0.8

### Patch Changes

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`0de7456`](https://github.com/clauderic/dnd-kit/commit/0de7456ade17b9a0aa127b8adf13495e7fdf1558) Thanks [@github-actions](https://github.com/apps/github-actions)! - Moved styles that override the default user agent styles for `[popover]` into a CSS layer to avoid overriding other layered styles on the page, such as Tailwind 4.

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`c9716cf`](https://github.com/clauderic/dnd-kit/commit/c9716cf7b8b846faab451bd2f60c53c77d2d24ba) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `isDragging` and `isDropping` properties to `draggable` and `sortable` instances.

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`74eedef`](https://github.com/clauderic/dnd-kit/commit/74eedef3441dc07d8fa8dd9337a6b2d748b0cdde) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**

  - End drag operation if `lostpointercapture` event is fired and the drag operation has not ended already. This can happen if the `pointerup` event is fired in a different frame.
  - Prevent `contextmenu` from opening during a drag operation.

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`42e7256`](https://github.com/clauderic/dnd-kit/commit/42e7256e7fb9c11ed6295b77e30c41ebe66a15d1) Thanks [@github-actions](https://github.com/apps/github-actions)! - - Fixed an invalid CSS selector in the `PreventSelection` plugin
  - Removed logic to prevent user selection in `Feedback` plugin (defer to `PreventSelection` plugin to handle this)
- Updated dependencies [[`c9716cf`](https://github.com/clauderic/dnd-kit/commit/c9716cf7b8b846faab451bd2f60c53c77d2d24ba), [`3ea0d31`](https://github.com/clauderic/dnd-kit/commit/3ea0d314649b186bfe0524d50145625da13a8787), [`3cf4db1`](https://github.com/clauderic/dnd-kit/commit/3cf4db126813ebe6ddfc025df5e42e9bfcfa9c38)]:
  - @dnd-kit/abstract@0.0.8
  - @dnd-kit/collision@0.0.8
  - @dnd-kit/geometry@0.0.8
  - @dnd-kit/state@0.0.8

## 0.0.7

### Patch Changes

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`550a868`](https://github.com/clauderic/dnd-kit/commit/550a86870d7441a38a06b3e7c35aa0d7d89e32d1) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `aria-grabbed` to the list of attributes added by the Accessibility plugin.

  Setting aria-grabbed to true indicates that the element has been selected for dragging. Setting aria-grabbed to false indicates that the element can be grabbed for a drag-and-drop operation, but is not currently grabbed.

  While the `aria-grabbed` attribute has been deprecated in ARIA 1.1, in practice, since the accessibility API features for accessible drag and drop still don’t exist and likely won’t for several years, these attributes will continue to be supported by browsers and reflected in the accessibility tree for some years to come until a new API is introduced to replace it.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`75e23b6`](https://github.com/clauderic/dnd-kit/commit/75e23b6fdfdeadeae1b9a4b2b9be7682f48c10e4) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `aria-grabbed` and `aria-pressed` to the list of attributes that are not synchronized between the draggable element and its placeholder.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`cef9b46`](https://github.com/clauderic/dnd-kit/commit/cef9b46c5ed017e6a601b1d0ee9d0f05b7bbd19f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix global modifiers set on `DragDropManager` / `<DragDropProvider>` being destroyed after the first drag operation.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`730064b`](https://github.com/clauderic/dnd-kit/commit/730064b8b06bd25ebde335305a303fdf4c9a9c7f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix incorrect type for modifiers.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`808f184`](https://github.com/clauderic/dnd-kit/commit/808f184439125cf7e66054b3e85ac087aa04f13b) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix reconciliation of optimistic updates in `move` helper.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`c4e7a7c`](https://github.com/clauderic/dnd-kit/commit/c4e7a7cd98ccaec99fa1037cb1020d3d05cea090) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed positioning of `Feedback` plugin when `direction` is set to `rtl`.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`280b7e2`](https://github.com/clauderic/dnd-kit/commit/280b7e229d5e6a5f067a66038e50c4fbb3b29dc0) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed stale modifiers when using `useSortable`.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`84b75fc`](https://github.com/clauderic/dnd-kit/commit/84b75fc3a7b7a555481dbeba533bc28128783e72) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed `element` not being set on initialization of `Sortable` instance even if an `element` was provided as input.

- Updated dependencies [[`c1dadef`](https://github.com/clauderic/dnd-kit/commit/c1dadef118f8f5f096d36dac314bfe317ea950ce), [`cef9b46`](https://github.com/clauderic/dnd-kit/commit/cef9b46c5ed017e6a601b1d0ee9d0f05b7bbd19f)]:
  - @dnd-kit/abstract@0.0.7
  - @dnd-kit/collision@0.0.7
  - @dnd-kit/geometry@0.0.7
  - @dnd-kit/state@0.0.7

## 0.0.6

### Patch Changes

- [#1567](https://github.com/clauderic/dnd-kit/pull/1567) [`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Add source maps to output.

- [#1499](https://github.com/clauderic/dnd-kit/pull/1499) [`d436037`](https://github.com/clauderic/dnd-kit/commit/d43603740a4d056e9fc7501e9b2117c173b1df4d) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Fix a bug that prevented all unique droppables that share an element from each receiving the cloned proxy.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`94920c8`](https://github.com/clauderic/dnd-kit/commit/94920c8a7a3a15accfb806b52e4935637b1a0781) Thanks [@github-actions](https://github.com/apps/github-actions)! - Batch write operations to `draggable` and `droppable`. Also ensured that droppable instance is registered before draggable instance.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69) Thanks [@github-actions](https://github.com/apps/github-actions)! - Rework how collisions are detected and how the position of elements is observed using a new `PositionObserver`.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`0676276`](https://github.com/clauderic/dnd-kit/commit/0676276f5423dbb4e0cad738ac3784937dc7504b) Thanks [@github-actions](https://github.com/apps/github-actions)! - Children contained in a closed `details ` element are no longer treated as visible.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`8053e4b`](https://github.com/clauderic/dnd-kit/commit/8053e4b4a727c6097b29fb559ce72362d7d6eb2a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow `Sortable` to have a distinct `element` from the underlying `source` and `target` elements. This can be useful if you want the collision detection to operate on a subset of the sortable element, but the entirety of the element to move when its index changes.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`f400106`](https://github.com/clauderic/dnd-kit/commit/f400106072d12a902f6c113b889c7de97f43e1ea) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improve the `Feedback` plugin to better handle when the feedback element resizes during a drag operation.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`c597b3f`](https://github.com/clauderic/dnd-kit/commit/c597b3fe1514f10e227c287dc8ad875134e9b4cb) Thanks [@github-actions](https://github.com/apps/github-actions)! - Introduce `rootElement` option on `Feedback` plugin.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a9798f4`](https://github.com/clauderic/dnd-kit/commit/a9798f43450e406e8cb235b7d5fba8bb809fd1d7) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix issues with `instanceof` checks in cross-window environments where the `window` of an element can differ from the execution context window.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`e70b29a`](https://github.com/clauderic/dnd-kit/commit/e70b29ae64837e424f7279c95112fb6e420c4dcc) Thanks [@github-actions](https://github.com/apps/github-actions)! - Make sure the generic for `DragDropManager` is passed through to `Entity` so that the `manager` reference on classes extending `Entity` is strongly typed.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`3d0b00a`](https://github.com/clauderic/dnd-kit/commit/3d0b00a663b9dc38ccd7a46544c94a342694b626) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix an issue where we would update the shape of sortable items while the drag operation status was idle.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`e6a8e01`](https://github.com/clauderic/dnd-kit/commit/e6a8e018d2d7ad9a11e5b05f07774c7e3ac08da3) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix a bug with `event.preventDefault()` and `event.stopPropagation()` being called on pointer up even if there was no drag operation in progress, which would prevent interactive elements such as buttons from being clicked.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`7ef9864`](https://github.com/clauderic/dnd-kit/commit/7ef98642207c8beac1ca7e2704ce8805767dc89d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed bugs with the `OptimisticSortingPlugin` when sorting across different groups.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`51be6df`](https://github.com/clauderic/dnd-kit/commit/51be6dfe1b8cb42f74df34c76098e197b9208f81) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix `element` not being set when provided on initialization of `Droppable`

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`fe76033`](https://github.com/clauderic/dnd-kit/commit/fe7603330fb4b0a397c0e2af641df94fc2879c35) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed a bug in the `KeyboardSensor` that would cause the sensor to activate when focusing elements within the sortable element other than the handle.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`62a8118`](https://github.com/clauderic/dnd-kit/commit/62a81180c84f7782b14b69b56f891c810e7d0f69) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `Tab` to the list of default keycodes that end the current drag operation.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`0c7bf85`](https://github.com/clauderic/dnd-kit/commit/0c7bf85897992dc48c3cf2f1deeaa896995bfcc3) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow the `OptimisticSortingPlugin` to sort elements across different groups.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`f219549`](https://github.com/clauderic/dnd-kit/commit/f219549087d9100cee53ab0cf35d820fe256aa85) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix pointer events no longer being detected by the `PointerSensor` when the event target is disconnected from the DOM by setting pointer capture on the document body for `pointermove` events.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`bfc8ab2`](https://github.com/clauderic/dnd-kit/commit/bfc8ab21cfd9c16a8d90ab250386e6d52d0a40a3) Thanks [@github-actions](https://github.com/apps/github-actions)! - **PointerSensor**: Defer invoking `setPointerCapture` until activation constraints are met as it can interfere with `click` and other event handlers. Also deferred adding `touchmove`, `click` and `keydown` event listeners until the activation constraints are met.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a5a556a`](https://github.com/clauderic/dnd-kit/commit/a5a556abfeec1d78effb3e047f529555e444c020) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed React lifecycle regressions related to StrictMode.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`b5edff1`](https://github.com/clauderic/dnd-kit/commit/b5edff19279c07bbcd54ebc4579817b8a36cfff5) Thanks [@github-actions](https://github.com/apps/github-actions)! - Remove `event.stopImmediatePropagation()` in `PointerSensor` and replace with a different strategy to prevent other instances of PointerSensor from tracking an event that was already captured by another sensor.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`3fb972e`](https://github.com/clauderic/dnd-kit/commit/3fb972e228aabfe07d662b77c642405f909fddb0) Thanks [@github-actions](https://github.com/apps/github-actions)! - **AccessibilityPlugin**: Force `tabindex="0"` in Safari even for natively focusable elements as they are not always focusable by default.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`5b36f8f`](https://github.com/clauderic/dnd-kit/commit/5b36f8fb36f5a4468793b469425b5c0461426f56) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow sortable animations when changing to a different group even when the index remains the same.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`69bfad7`](https://github.com/clauderic/dnd-kit/commit/69bfad7d795947987a4281f1a61f81b6a7839fe8) Thanks [@github-actions](https://github.com/apps/github-actions)! - `SortableKeyboardPlugin`: Use `closestCorners` collision detection algorithm instead of `closestCenter` when keyboard sorting.

- [#1517](https://github.com/clauderic/dnd-kit/pull/1517) [`c42a11b`](https://github.com/clauderic/dnd-kit/commit/c42a11b60e950d50f8c243bdf8df4f32e1d47d23) Thanks [@clauderic](https://github.com/clauderic)! - Support dragging across same-origin iframes.

- Updated dependencies [[`984b5ab`](https://github.com/clauderic/dnd-kit/commit/984b5ab7bec3145dedb9c9b3b560ffbf7e54b919), [`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0), [`69bfad7`](https://github.com/clauderic/dnd-kit/commit/69bfad7d795947987a4281f1a61f81b6a7839fe8), [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69), [`a8542de`](https://github.com/clauderic/dnd-kit/commit/a8542de56d39c3cd3b6ef981172a0782454295b2), [`f7458d9`](https://github.com/clauderic/dnd-kit/commit/f7458d9dc32824dbea3a6d5dfb29236f19a2c073), [`b750c05`](https://github.com/clauderic/dnd-kit/commit/b750c05b4b14f5d9817dc07d974d40b74470e904), [`e70b29a`](https://github.com/clauderic/dnd-kit/commit/e70b29ae64837e424f7279c95112fb6e420c4dcc), [`4d1a030`](https://github.com/clauderic/dnd-kit/commit/4d1a0306c920ae064eb5b30c4c02961f50460c84), [`a6366f9`](https://github.com/clauderic/dnd-kit/commit/a6366f9e42836b4c5732141bf314489ede9f60cb), [`a5933d8`](https://github.com/clauderic/dnd-kit/commit/a5933d8607e63ed08818ffab43e858863cb35d47), [`a5a556a`](https://github.com/clauderic/dnd-kit/commit/a5a556abfeec1d78effb3e047f529555e444c020), [`96f28ef`](https://github.com/clauderic/dnd-kit/commit/96f28ef86adf95e77540732d39033c7f3fb0fd04), [`71dc39f`](https://github.com/clauderic/dnd-kit/commit/71dc39fb2ec21b9a680238a91be419c71ecabe86)]:
  - @dnd-kit/abstract@0.0.6
  - @dnd-kit/collision@0.0.6
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
