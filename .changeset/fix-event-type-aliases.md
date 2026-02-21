---
'@dnd-kit/abstract': minor
'@dnd-kit/dom': minor
'@dnd-kit/helpers': minor
'@dnd-kit/react': minor
'@dnd-kit/solid': minor
'@dnd-kit/vue': minor
'@dnd-kit/svelte': minor
---

Redesign event type system to follow the DOM EventMap pattern. Introduces `DragDropEventMap` for event object types and `DragDropEventHandlers` for event handler signatures, replacing the ambiguously named `DragDropEvents`. Event type aliases (`CollisionEvent`, `DragStartEvent`, etc.) now derive directly from `DragDropEventMap` rather than using `Parameters<>` extraction.

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
  const handler: DragDropEventHandlers<D, P, M>['dragend'] = (event, manager) => {};
  ```
- The `DragDropEvents` re-export from `@dnd-kit/react` and `@dnd-kit/solid` has been removed. Import `DragDropEventMap` or `DragDropEventHandlers` from `@dnd-kit/abstract` directly if needed.
- Convenience aliases (`CollisionEvent`, `DragStartEvent`, `DragEndEvent`, etc.) are unchanged and continue to work as before.
