# @dnd-kit/react

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/react.svg)](https://npm.im/@dnd-kit/react)

React layer for @dnd-kit, built on top of @dnd-kit/dom

## Overview

`@dnd-kit/react` provides idiomatic React bindings for dnd-kit, built on top of [@dnd-kit/dom](../dom). It offers a context provider, hooks for creating draggable and droppable components, a sortable hook, a drag overlay component, and event monitoring -- all designed to work seamlessly with React's rendering lifecycle and concurrent features.

This is the recommended package for React applications. It handles manager creation, entity registration/cleanup tied to component lifecycles, ref-based element binding, and reactive state updates that trigger efficient re-renders.

## Installation

```
npm install @dnd-kit/react
```

**Peer dependencies:** `react` (^18.0.0 or ^19.0.0), `react-dom` (^18.0.0 or ^19.0.0)

## Architecture

`@dnd-kit/react` is the top layer in the dnd-kit stack:

```
@dnd-kit/abstract          (framework-agnostic core)
  |
  +-- @dnd-kit/dom          (DOM implementation)
        |
        +-- @dnd-kit/react   (React integration)
              |
              +-- DragDropProvider   (context + manager lifecycle)
              +-- useDraggable       (hook for draggable elements)
              +-- useDroppable       (hook for droppable zones)
              +-- useSortable        (hook for sortable items)
              +-- DragOverlay        (custom drag overlay component)
              +-- useDragDropMonitor (event subscription hook)
              +-- useDragOperation   (reactive drag state hook)
```

The hooks create and manage `@dnd-kit/dom` entity instances under the hood, synchronizing React props to the underlying imperative API and cleaning up automatically when components unmount.

## Key Exports

### Context

| Export             | Description                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DragDropProvider` | Root context provider that creates and manages a `DragDropManager`. Wrap your application (or the drag-and-drop region) with this component. Accepts event handler props and configuration for sensors, plugins, and modifiers. |

### Hooks

| Export               | Description                                                                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useDraggable`       | Creates a draggable entity bound to a React component. Returns `ref`, `handleRef`, the `draggable` instance, and reactive status getters (`isDragging`, `isDropping`, `isDragSource`).                     |
| `useDroppable`       | Creates a droppable entity bound to a React component. Returns `ref`, the `droppable` instance, and a reactive `isDropTarget` getter.                                                                      |
| `useDragDropManager` | Returns the current `DragDropManager` instance from context (or `null` outside a provider).                                                                                                                |
| `useDragDropMonitor` | Subscribes to drag and drop events anywhere within a `DragDropProvider`. Accepts an object of event handlers (`onBeforeDragStart`, `onDragStart`, `onDragMove`, `onDragOver`, `onDragEnd`, `onCollision`). |
| `useDragOperation`   | Returns reactive `source` and `target` getters for the current drag operation.                                                                                                                             |
| `useInstance`        | Low-level hook for creating entity instances bound to the manager lifecycle.                                                                                                                               |

### Components

| Export        | Description                                                                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DragOverlay` | Renders a custom overlay element during drag operations. Accepts `children` as a ReactNode or a render function `(source) => ReactNode`. Supports `className`, `style`, `tag`, and `disabled` props. Prevents children from registering as entities. |

### Re-exports from @dnd-kit/dom

| Export            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `PointerSensor`   | DOM pointer sensor (mouse, touch, pen)             |
| `KeyboardSensor`  | DOM keyboard sensor                                |
| `DragDropManager` | The DOM manager type (re-exported for convenience) |

## Usage

### Basic Drag and Drop

```tsx
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';

function App() {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const {source, target} = event.operation;
        if (!event.canceled && target) {
          console.log(`Dropped ${source?.id} onto ${target.id}`);
        }
      }}
    >
      <DraggableItem id="item-1" />
      <DroppableZone id="zone-1" />
    </DragDropProvider>
  );
}

function DraggableItem({id}: {id: string}) {
  const {ref, isDragging} = useDraggable({id});

  return (
    <div ref={ref} style={{opacity: isDragging ? 0.5 : 1}}>
      Drag me
    </div>
  );
}

function DroppableZone({id}: {id: string}) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <div ref={ref} style={{background: isDropTarget ? 'lightgreen' : 'white'}}>
      Drop here
    </div>
  );
}
```

### Using a Drag Handle

```tsx
function DraggableWithHandle({id}: {id: string}) {
  const {ref, handleRef, isDragging} = useDraggable({id});

  return (
    <div ref={ref} style={{opacity: isDragging ? 0.5 : 1}}>
      <button ref={handleRef}>Grip</button>
      <span>Content</span>
    </div>
  );
}
```

### DragDropProvider Configuration

The provider accepts all the configuration options of the DOM `DragDropManager`, plus event handler props:

```tsx
import {DragDropProvider, PointerSensor} from '@dnd-kit/react';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

function App() {
  return (
    <DragDropProvider
      sensors={[
        PointerSensor.configure({
          activationConstraints: {delay: 200, tolerance: 5},
        }),
      ]}
      modifiers={[RestrictToWindow]}
      onBeforeDragStart={(event) => {
        // Can call event.preventDefault() to cancel the drag
      }}
      onDragStart={(event, manager) => {
        console.log('Drag started:', event.operation.source?.id);
      }}
      onDragOver={(event, manager) => {
        console.log('Over target:', event.operation.target?.id);
      }}
      onDragEnd={(event, manager) => {
        if (!event.canceled) {
          // Handle the drop
        }
      }}
    >
      {/* ... */}
    </DragDropProvider>
  );
}
```

### Using a Custom Drag Overlay

```tsx
import {DragDropProvider, useDraggable, DragOverlay} from '@dnd-kit/react';

function App() {
  return (
    <DragDropProvider>
      <DraggableItem id="item-1" />
      <DragOverlay>{(source) => <div>Dragging: {source.id}</div>}</DragOverlay>
    </DragDropProvider>
  );
}
```

### Monitoring Events from Anywhere

```tsx
import {useDragDropMonitor} from '@dnd-kit/react';

function StatusIndicator() {
  useDragDropMonitor({
    onDragStart() {
      console.log('A drag operation started');
    },
    onDragEnd(event) {
      console.log('A drag operation ended, canceled:', event.canceled);
    },
  });

  return null;
}
```

### Accessing Drag Operation State

```tsx
import {useDragOperation} from '@dnd-kit/react';

function DragStatus() {
  const {source, target} = useDragOperation();

  if (!source) return <p>Nothing is being dragged</p>;

  return (
    <p>
      Dragging {source.id}
      {target ? ` over ${target.id}` : ''}
    </p>
  );
}
```

### Using Custom Data

```tsx
interface CardData {
  title: string;
  color: string;
}

function Card({id, title, color}: {id: string; title: string; color: string}) {
  const {ref, isDragging} = useDraggable({
    id,
    data: {title, color},
  });

  return <div ref={ref}>{title}</div>;
}
```

## Sub-modules

### `@dnd-kit/react/sortable`

React bindings for sortable lists.

| Export        | Description                                                                                                                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useSortable` | Hook that creates a combined draggable/droppable entity for sortable lists. Accepts `index`, `group`, `transition`, and all draggable/droppable options. Returns `ref`, `handleRef`, `sourceRef`, `targetRef`, the `sortable` instance, and reactive status getters (`isDragging`, `isDropping`, `isDragSource`, `isDropTarget`). |
| `isSortable`  | Type guard re-exported from `@dnd-kit/dom/sortable`                                                                                                                                                                                                                                                                               |

```tsx
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';

function SortableList() {
  const [items, setItems] = useState(['A', 'B', 'C', 'D']);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        // Reorder items based on event.operation
      }}
    >
      {items.map((item, index) => (
        <SortableItem key={item} id={item} index={index} />
      ))}
    </DragDropProvider>
  );
}

function SortableItem({id, index}: {id: string; index: number}) {
  const {ref, isDragging} = useSortable({
    id,
    index,
    transition: {duration: 250, easing: 'ease'},
  });

  return (
    <div ref={ref} style={{opacity: isDragging ? 0.5 : 1}}>
      {id}
    </div>
  );
}
```

The `useSortable` hook supports all the options of `useDraggable` and `useDroppable`, plus:

- `index` (required) -- The current position in the list
- `group` -- Optional group identifier for multi-list sorting
- `transition` -- Animation configuration `{ duration, easing, idle }` (set to `null` to disable)
- `accept` -- Types of draggables this sortable accepts
- `collisionDetector` / `collisionPriority` -- Collision detection configuration
- `feedback` -- Visual feedback type during drag
- `target` -- Separate droppable target element ref

### `@dnd-kit/react/hooks`

Internal React hooks used by the core package. Available for advanced use cases:

| Export                      | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `useConstant`               | Creates a value once and returns it on subsequent renders     |
| `useComputed`               | Creates a computed signal value that triggers re-renders      |
| `useDeepSignal`             | Deeply tracks reactive properties on an object for re-renders |
| `useImmediateEffect`        | Effect that runs synchronously                                |
| `useIsomorphicLayoutEffect` | `useLayoutEffect` on client, `useEffect` on server            |
| `useLatest`                 | Ref that always holds the latest value                        |
| `useOnValueChange`          | Runs a callback when a value changes                          |
| `useOnElementChange`        | Runs a callback when a ref/element changes                    |

### `@dnd-kit/react/utilities`

Utility types and functions:

| Export          | Description                                            |
| --------------- | ------------------------------------------------------ |
| `currentValue`  | Extracts the current value from a `RefOrValue<T>`      |
| `RefOrValue<T>` | Type representing either a React ref or a direct value |

## Types

Key TypeScript types exported by this package:

- `DragDropEvents` -- Type alias for the event map used by event handler props
- `DragDropEventHandlers` -- Object type mapping handler names (`onDragStart`, etc.) to handler functions
- `UseDraggableInput` -- Input options for `useDraggable` (extends `DraggableInput` with ref support)
- `UseDroppableInput` -- Input options for `useDroppable` (extends `DroppableInput` with ref support)
- `UseSortableInput` -- Input options for `useSortable` (extends `SortableInput` with ref support)

## Related Packages

- [@dnd-kit/dom](../dom) -- DOM implementation layer that this package builds upon
- [@dnd-kit/abstract](../abstract) -- Framework-agnostic core abstractions
- [@dnd-kit/collision](../../packages/collision) -- Collision detection algorithms
- [@dnd-kit/geometry](../../packages/geometry) -- Geometry primitives
- [@dnd-kit/state](../../packages/state) -- Reactive state management

## License

MIT
