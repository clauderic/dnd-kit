# @dnd-kit/react

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/react.svg)](https://npm.im/@dnd-kit/react)

The React adapter for **@dnd-kit** — a lightweight, performant, and extensible drag and drop toolkit. Built on top of `@dnd-kit/dom`.

## Installation

```bash
npm install @dnd-kit/react
```

## Quick start

```tsx
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';

function App() {
  const [parent, setParent] = useState(null);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id ?? null);
      }}
    >
      {parent == null ? <Draggable /> : null}
      <Droppable>{parent ? <Draggable /> : 'Drop here'}</Droppable>
    </DragDropProvider>
  );
}
```

## Hooks

| Hook           | Import                    | Description                        |
| -------------- | ------------------------- | ---------------------------------- |
| `useDraggable` | `@dnd-kit/react`          | Make an element draggable          |
| `useDroppable` | `@dnd-kit/react`          | Create a drop target               |
| `useSortable`  | `@dnd-kit/react/sortable` | Combine drag and drop with sorting |

## Components

- **`<DragDropProvider>`** — Wraps your drag and drop interface, manages sensors, plugins, and events.
- **`<DragOverlay>`** — Renders a custom overlay element during drag operations.

## Documentation

Visit [dndkit.com](https://dndkit.com/react) for full documentation, guides, and interactive examples.
