# @dnd-kit/svelte

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/svelte.svg)](https://npm.im/@dnd-kit/svelte)

The Svelte adapter for **@dnd-kit** — a lightweight, performant, and extensible drag and drop toolkit. Built on top of `@dnd-kit/dom`, it provides idiomatic Svelte 5 primitives using runes and [attachments](https://svelte.dev/docs/svelte/@attach).

## Requirements

- Svelte **5.29** or later

## Installation

```bash
npm install @dnd-kit/svelte
```

## Quick start

```svelte
<script>
  import {DragDropProvider, createDraggable, createDroppable} from '@dnd-kit/svelte';

  let droppedIn = $state(false);

  const draggable = createDraggable({id: 'draggable'});
  const droppable = createDroppable({id: 'droppable'});

  function onDragEnd(event) {
    if (event.canceled) return;
    droppedIn = event.operation.target?.id === 'droppable';
  }
</script>

<DragDropProvider {onDragEnd}>
  {#if !droppedIn}
    <button {@attach draggable.attach}>Drag me</button>
  {/if}

  <div {@attach droppable.attach}>
    {#if droppedIn}
      <button {@attach draggable.attach}>Dropped!</button>
    {/if}
  </div>
</DragDropProvider>
```

## Primitives

| Primitive         | Import                     | Description                        |
| ----------------- | -------------------------- | ---------------------------------- |
| `createDraggable` | `@dnd-kit/svelte`          | Make an element draggable          |
| `createDroppable` | `@dnd-kit/svelte`          | Create a drop target               |
| `createSortable`  | `@dnd-kit/svelte/sortable` | Combine drag and drop with sorting |

Each primitive returns an object with reactive state (e.g. `isDragging`, `isDropTarget`) and `attach` / `attachHandle` functions for use with the `{@attach}` directive.

## Components

- **`<DragDropProvider>`** — Wraps your drag and drop interface, manages sensors, plugins, and events.
- **`<DragOverlay>`** — Renders a custom overlay element during drag operations.

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com/svelte) for full documentation, guides, and interactive examples.
