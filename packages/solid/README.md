# @dnd-kit/solid

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/solid.svg)](https://npm.im/@dnd-kit/solid)

The SolidJS adapter for **@dnd-kit** — a lightweight, performant, and extensible drag and drop toolkit. Built on top of `@dnd-kit/dom`.

## Installation

```bash
npm install @dnd-kit/solid
```

## Quick start

```tsx
import {createSignal} from 'solid-js';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/solid';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});
  return <button ref={ref}>Drag me</button>;
}

function Droppable(props) {
  const {ref} = useDroppable({id: 'droppable'});
  return <div ref={ref}>{props.children}</div>;
}

function App() {
  const [parent, setParent] = createSignal(null);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id ?? null);
      }}
    >
      {parent() == null ? <Draggable /> : null}
      <Droppable>{parent() ? <Draggable /> : 'Drop here'}</Droppable>
    </DragDropProvider>
  );
}
```

## Hooks

| Hook | Import | Description |
|---|---|---|
| `useDraggable` | `@dnd-kit/solid` | Make an element draggable |
| `useDroppable` | `@dnd-kit/solid` | Create a drop target |
| `useSortable` | `@dnd-kit/solid/sortable` | Combine drag and drop with sorting |

## Components

- **`<DragDropProvider>`** — Wraps your drag and drop interface, manages sensors, plugins, and events.
- **`<DragOverlay>`** — Renders a custom overlay element during drag operations.

## Documentation

Visit [next.dndkit.com](https://next.dndkit.com/solid) for full documentation, guides, and interactive examples.
