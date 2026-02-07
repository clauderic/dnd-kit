# @dnd-kit/dom

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/dom.svg)](https://npm.im/@dnd-kit/dom)

DOM implementation layer for @dnd-kit, built on top of @dnd-kit/abstract

## Overview

`@dnd-kit/dom` extends the framework-agnostic abstractions of [@dnd-kit/abstract](../abstract) with concrete implementations designed for the browser DOM. It provides a `DragDropManager` pre-configured with DOM-specific sensors (pointer and keyboard), plugins (scrolling, accessibility, visual feedback, cursor management), and DOM-aware `Draggable` and `Droppable` entities that bind directly to HTML elements.

This package can be used on its own for vanilla JavaScript/TypeScript projects, or it serves as the platform layer that [@dnd-kit/react](../react) builds upon.

## Installation

```
npm install @dnd-kit/dom
```

## Architecture

`@dnd-kit/dom` follows a layered architecture that builds on `@dnd-kit/abstract`:

```
@dnd-kit/abstract          (framework-agnostic core)
  |
  +-- @dnd-kit/dom          (DOM-specific implementation)
        |
        +-- DragDropManager   (extends abstract manager with default preset)
        +-- Draggable         (adds element, handle, feedback)
        +-- Droppable         (adds element, shape observation, position tracking)
        +-- PointerSensor     (mouse, touch, pen input)
        +-- KeyboardSensor    (keyboard-driven drag)
        +-- Plugins           (Accessibility, AutoScroller, Cursor, Feedback, etc.)
        +-- Sortable          (higher-level sortable preset)
```

### Default Preset

When you create a `DragDropManager` without arguments, it comes pre-configured with:

**Sensors:** `PointerSensor`, `KeyboardSensor`

**Plugins:** `Accessibility`, `AutoScroller`, `Cursor`, `Feedback`, `PreventSelection`, `ScrollListener`, `Scroller`

You can override any of these by passing your own `sensors` or `plugins` arrays.

## Key Exports

### Manager

| Export            | Description                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `DragDropManager` | DOM-specific manager, pre-configured with the default preset. Extends the abstract `DragDropManager`. |
| `defaultPreset`   | The default `{ sensors, plugins, modifiers }` configuration object                                    |

### Entities

| Export      | Description                                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Draggable` | DOM draggable entity. Adds `element` (the DOM element), `handle` (optional drag handle element), and `feedback` (`'default'`, `'move'`, `'clone'`, or `'none'`) on top of the abstract `Draggable`.                   |
| `Droppable` | DOM droppable entity. Adds `element` (the DOM element), automatic shape tracking via `PositionObserver`, and `refreshShape()`. Defaults collision detection to `defaultCollisionDetection` from `@dnd-kit/collision`. |

### Sensors

| Export                         | Description                                                                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PointerSensor`                | Handles mouse, touch, and pen interactions. Supports configurable activation constraints (delay, distance), custom activator elements, and `preventActivation` logic. Smart defaults differentiate between mouse, touch, and text input contexts. |
| `PointerActivationConstraints` | Pre-built activation constraints: `Delay` and `Distance`                                                                                                                                                                                          |
| `KeyboardSensor`               | Handles keyboard-driven drag operations using arrow keys. Configurable key codes, movement offset (default 10px, 5x with Shift), and start/end/cancel keys. Automatically disables `AutoScroller` during keyboard drags.                          |

Both sensors support static `configure()` for creating pre-configured variants:

```typescript
const CustomPointerSensor = PointerSensor.configure({
  activationConstraints: {delay: 200, tolerance: 5},
});
```

### Plugins

| Export             | Description                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Accessibility`    | Injects ARIA live regions for screen reader announcements                                                                         |
| `AutoScroller`     | Automatically scrolls ancestor containers when dragging near edges                                                                |
| `Cursor`           | Manages cursor styles during drag operations                                                                                      |
| `Feedback`         | Renders visual feedback for the dragged element (move, clone, or overlay). Handles drop animations with configurable transitions. |
| `PreventSelection` | Prevents text selection during drag operations                                                                                    |
| `Scroller`         | Core scrolling infrastructure used by `AutoScroller`                                                                              |
| `ScrollListener`   | Listens to scroll events to update droppable positions                                                                            |

### Types

- `DragDropManagerInput` -- Configuration for the DOM manager constructor
- `DraggableInput` -- Input configuration for creating a DOM `Draggable`
- `DroppableInput` -- Input configuration for creating a DOM `Droppable`
- `FeedbackType` -- `'default' | 'move' | 'clone' | 'none'`
- `Sensors` -- DOM-specific sensor array type
- `PointerSensorOptions` -- Configuration for `PointerSensor`
- `KeyboardSensorOptions` -- Configuration for `KeyboardSensor`
- `Transition` -- Transition configuration for drop animations

## Usage

### Basic Drag and Drop

```typescript
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

// Create a manager with default sensors and plugins
const manager = new DragDropManager();

// Create a draggable bound to a DOM element
const draggable = new Draggable(
  {
    id: 'item-1',
    element: document.getElementById('draggable-item'),
    feedback: 'move', // The element moves during drag
  },
  manager
);

// Create a droppable bound to a DOM element
const droppable = new Droppable(
  {
    id: 'drop-zone',
    element: document.getElementById('drop-zone'),
    accept: 'card', // Only accept draggables with type 'card'
  },
  manager
);

// Listen for events
manager.monitor.addEventListener('dragend', (event) => {
  const {source, target} = event.operation;

  if (!event.canceled && target) {
    console.log(`Dropped ${source?.id} onto ${target.id}`);
  }
});
```

### Custom Sensor Configuration

```typescript
import {DragDropManager, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';

const manager = new DragDropManager({
  sensors: [
    PointerSensor.configure({
      activationConstraints: {delay: 150, tolerance: 8},
    }),
    KeyboardSensor.configure({
      offset: {x: 20, y: 20},
    }),
  ],
});
```

### Using a Drag Handle

```typescript
const draggable = new Draggable(
  {
    id: 'item-1',
    element: document.getElementById('item'),
    handle: document.getElementById('item-handle'),
  },
  manager
);
```

## Sub-modules

### `@dnd-kit/dom/sortable`

A higher-level abstraction for sortable lists. The `Sortable` class combines a `Draggable` and `Droppable` into a single entity that tracks its `index` and `group`, and animates position changes with configurable transitions.

| Export                      | Description                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sortable`                  | Combined draggable/droppable entity for sortable lists. Tracks `index`, `group`, `initialIndex`, `initialGroup`. Supports animated transitions on index changes. |
| `SortableKeyboardPlugin`    | Plugin that enables keyboard-based sorting                                                                                                                       |
| `OptimisticSortingPlugin`   | Plugin for optimistic index updates during drag                                                                                                                  |
| `isSortable`                | Type guard to check if an entity is a `Sortable`                                                                                                                 |
| `defaultSortableTransition` | Default transition config: `{ duration: 250, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', idle: false }`                                                             |

```typescript
import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

const manager = new DragDropManager();

const items = ['A', 'B', 'C'].map(
  (item, index) =>
    new Sortable(
      {
        id: item,
        index,
        element: document.getElementById(`item-${item}`),
        feedback: 'move',
        transition: {duration: 300, easing: 'ease-in-out'},
      },
      manager
    )
);
```

### `@dnd-kit/dom/modifiers`

DOM-specific transform modifiers.

| Export              | Description                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RestrictToWindow`  | Restricts drag movement to stay within the browser viewport. Automatically updates on window resize.                                                                                |
| `RestrictToElement` | Restricts drag movement within a specified DOM element. Observes element resize and scroll changes. Configure with `{ element: Element }` or `{ element: (operation) => Element }`. |

```typescript
import {DragDropManager} from '@dnd-kit/dom';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

const manager = new DragDropManager({
  modifiers: [RestrictToWindow],
});
```

### `@dnd-kit/dom/utilities`

Low-level DOM utility functions used internally. Includes helpers for bounding rectangles, coordinates, scroll detection, element cloning, transform parsing, animation, scheduling, and type guards. These are available for advanced use cases but are not part of the stable public API surface.

## Related Packages

- [@dnd-kit/abstract](../abstract) -- Framework-agnostic core that this package extends
- [@dnd-kit/react](../react) -- React integration layer built on this package
- [@dnd-kit/collision](../../packages/collision) -- Collision detection algorithms (used by `Droppable`)
- [@dnd-kit/geometry](../../packages/geometry) -- Geometry primitives
- [@dnd-kit/state](../../packages/state) -- Reactive state management

## License

MIT
