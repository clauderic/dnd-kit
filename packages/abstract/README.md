# @dnd-kit/abstract

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/abstract.svg)](https://npm.im/@dnd-kit/abstract)

Framework-agnostic core abstractions for the dnd-kit drag and drop toolkit.

## Overview

`@dnd-kit/abstract` provides the foundational building blocks for implementing drag and drop functionality. It defines the core architecture -- entities, sensors, plugins, modifiers, collision detection, and the central manager -- without coupling to any specific rendering environment. Concrete implementation layers like [@dnd-kit/dom](../dom) and [@dnd-kit/react](../react) extend these abstractions for their respective platforms.

> **Note:** This package is intended for authors building custom implementation layers on top of dnd-kit. If you are building a web application, use [@dnd-kit/dom](../dom) or [@dnd-kit/react](../react) instead.

## Installation

```
npm install @dnd-kit/abstract
```

## Architecture

The architecture is centered around a `DragDropManager` that orchestrates all drag and drop operations. It connects entities (draggables and droppables), sensors (input handlers), plugins (behavioral extensions), modifiers (transform adjustments), and a collision detection system.

```
DragDropManager
  |-- DragOperation       (tracks current drag state, position, transform)
  |-- DragActions          (start, move, stop operations)
  |-- DragDropRegistry     (manages registered entities, sensors, plugins)
  |-- CollisionObserver    (detects collisions between draggable and droppables)
  |-- DragDropMonitor      (event dispatching and subscription)
  |-- Renderer             (rendering lifecycle integration)
```

## Key Exports

### Manager

| Export | Description |
|---|---|
| `DragDropManager` | Central orchestrator class for drag and drop operations |
| `DragOperationStatus` | Reactive status tracker with states: `idle`, `initializing`, `dragging`, `dropped` |

The manager accepts an input object with optional `plugins`, `sensors`, `modifiers`, and `renderer`.

### Entities

| Export | Description |
|---|---|
| `Entity` | Base class for all entities in the drag and drop system |
| `Draggable` | Represents an element that can be dragged. Tracks `isDragging`, `isDropping`, `isDragSource` status. Supports `type`, `sensors`, `modifiers`, and `alignment`. |
| `Droppable` | Represents an element that can receive drops. Supports `accept` rules (by type or custom function), `collisionDetector`, `collisionPriority`, and `shape`. Tracks `isDropTarget` status. |

Entities are identified by a `UniqueIdentifier` (string or number) and can carry arbitrary `data`. They automatically register and unregister with the manager.

### Sensors

| Export | Description |
|---|---|
| `Sensor` | Abstract base class for input sensors. Sensors detect user interactions and translate them into drag operations. Must implement a `bind(source, options)` method that returns a cleanup function. |
| `ActivationConstraint` | Base class for defining activation constraints (e.g., delay, distance thresholds) |
| `ActivationController` | Manages activation constraint evaluation before a drag starts |

Sensors extend `Plugin` and can be configured per-draggable or globally on the manager.

### Plugins

| Export | Description |
|---|---|
| `Plugin` | Base class for extending drag and drop behavior. Supports reactive `disabled` state, `registerEffect()` for managed side effects, and `configure()` for options. |
| `CorePlugin` | Marker subclass for built-in plugins |
| `PluginRegistry` | Manages plugin lifecycle (instantiation, registration, destruction) |
| `configure` / `configurator` / `descriptor` | Utility functions for configuring plugin constructors with options |

### Collision Detection

| Export | Description |
|---|---|
| `CollisionPriority` | Enum: `Lowest`, `Low`, `Normal`, `High`, `Highest` |
| `CollisionType` | Enum: `Collision`, `ShapeIntersection`, `PointerIntersection` |
| `sortCollisions` | Utility to sort collisions by priority and value |

The `CollisionDetector` type is a function that receives a `CollisionDetectorInput` (containing the `droppable` and `dragOperation`) and returns a `Collision` object or `null`.

### Modifiers

| Export | Description |
|---|---|
| `Modifier` | Base class for transform modifiers. Override `apply(operation)` to return modified coordinates. |

### Events

The `DragDropMonitor` dispatches the following events:

| Event | Description |
|---|---|
| `beforedragstart` | Fired before a drag starts. Preventable -- calling `preventDefault()` cancels the drag. |
| `dragstart` | Fired when a drag operation begins. Not cancelable. |
| `dragmove` | Fired on each move during a drag. Preventable. |
| `dragover` | Fired when the drop target changes. Preventable. |
| `collision` | Fired when collisions are detected. Preventable. |
| `dragend` | Fired when a drag operation ends. Provides `canceled` flag and `suspend()` for async drop animations. |

## Sub-modules

### `@dnd-kit/abstract/modifiers`

Pre-built modifiers for common transform restrictions.

| Export | Description |
|---|---|
| `AxisModifier` | Restricts movement to a specific axis with a fixed value |
| `RestrictToVerticalAxis` | Pre-configured `AxisModifier` that only allows vertical movement |
| `RestrictToHorizontalAxis` | Pre-configured `AxisModifier` that only allows horizontal movement |
| `SnapModifier` | Snaps movement to a grid. Configure with `{ size: number }` or `{ size: { x, y } }` |
| `restrictShapeToBoundingRectangle` | Utility function to constrain a shape within a bounding rectangle |

## Usage

### Creating a Manager

```typescript
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/abstract';

const manager = new DragDropManager({
  plugins: [],
  sensors: [],
  modifiers: [],
});
```

### Defining Entities

```typescript
const draggable = new Draggable(
  {id: 'draggable-1', type: 'card'},
  manager
);

const droppable = new Droppable(
  {
    id: 'droppable-1',
    accept: 'card',
    collisionDetector: myCollisionDetector,
  },
  manager
);
```

### Creating a Custom Sensor

```typescript
import {Sensor} from '@dnd-kit/abstract';

class CustomSensor extends Sensor {
  bind(source, options) {
    // Set up event listeners on the source
    // Call this.manager.actions.start(), .move(), .stop()
    // Return a cleanup function
    return () => { /* unbind listeners */ };
  }
}
```

### Creating a Custom Modifier

```typescript
import {Modifier} from '@dnd-kit/abstract';

class SnapToGrid extends Modifier {
  apply({transform}) {
    const gridSize = 20;
    return {
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  }
}
```

### Creating a Custom Plugin

```typescript
import {Plugin} from '@dnd-kit/abstract';

class LoggingPlugin extends Plugin {
  constructor(manager, options) {
    super(manager, options);

    this.registerEffect(() => {
      const {status} = manager.dragOperation;

      if (status.dragging) {
        console.log('Drag operation started');
        return () => console.log('Drag operation ended');
      }
    });
  }
}
```

### Monitoring Events

```typescript
const unsubscribe = manager.monitor.addEventListener('dragend', (event, mgr) => {
  if (!event.canceled) {
    console.log('Dropped:', event.operation.source?.id, '->', event.operation.target?.id);
  }
});
```

## Types

Key TypeScript types exported by this package:

- `DragDropManagerInput` -- Configuration object for the manager constructor
- `DragOperation` -- Snapshot of the current drag operation state
- `DragActions` -- Interface for start/move/stop actions
- `DragDropEvents` -- Type map of all drag and drop event handlers
- `Renderer` -- Interface for rendering lifecycle hooks
- `UniqueIdentifier` -- `string | number` type for entity IDs
- `Data` -- Arbitrary data attached to entities
- `Type` -- String type for entity categorization
- `CollisionDetector` -- Function type for custom collision detection
- `Collision` -- Collision result object with `id`, `priority`, `type`, `value`
- `SensorConstructor`, `SensorDescriptor`, `Sensors` -- Sensor configuration types
- `PluginConstructor`, `PluginDescriptor`, `Plugins` -- Plugin configuration types
- `ModifierConstructor`, `Modifiers` -- Modifier configuration types

## Related Packages

- [@dnd-kit/dom](../dom) -- DOM implementation layer built on this package
- [@dnd-kit/react](../react) -- React integration layer
- [@dnd-kit/collision](../../packages/collision) -- Collection of collision detection algorithms
- [@dnd-kit/geometry](../../packages/geometry) -- Geometry primitives (shapes, coordinates, rectangles)
- [@dnd-kit/state](../../packages/state) -- Reactive state management primitives

## License

MIT
