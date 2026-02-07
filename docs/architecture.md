# dnd-kit Architecture

This document describes the internal architecture of dnd-kit, a modular drag-and-drop toolkit organized as a monorepo. The design is built around a layered architecture that separates concerns across multiple packages, allowing framework-agnostic primitives to be extended for specific platforms (DOM) and UI frameworks (React).

## Table of Contents

- [Layered Architecture](#layered-architecture)
- [Package Dependency Graph](#package-dependency-graph)
- [Core Concepts](#core-concepts)
- [Data Flow: Lifecycle of a Drag Operation](#data-flow-lifecycle-of-a-drag-operation)
- [Key Design Patterns](#key-design-patterns)

---

## Layered Architecture

The project is organized into three distinct layers, each building on the one below it.

### Foundation Layer

These packages provide low-level primitives with no dependency on any UI framework or platform.

**`@dnd-kit/state`** -- Reactive state management built on `@preact/signals-core`. Provides signals, computed values, effects, and TypeScript decorators (`@reactive`, `@derived`) that power the reactivity of the entire system. This is the only package that depends on a third-party library (`@preact/signals-core`).

**`@dnd-kit/geometry`** -- Geometric primitives: `Shape`, `Rectangle`, `Point`, `Position`, distance calculations, coordinates, bounding rectangles, axes, and alignment types. Depends on `@dnd-kit/state` because `Position` uses reactive `ValueHistory` for tracking current/initial/previous values.

**`@dnd-kit/collision`** -- Collision detection algorithms: `pointerIntersection`, `shapeIntersection`, `closestCenter`, `closestCorners`, `pointerDistance`, `directionBiased`, and the composite `defaultCollisionDetection`. Each algorithm is a pure function conforming to the `CollisionDetector` type defined in `@dnd-kit/abstract`.

**`@dnd-kit/helpers`** -- Shared utilities for common operations such as `move`, `swap`, `arrayMove`, and `arraySwap`. These helpers simplify reordering arrays in response to drag events.

### Abstract Layer

**`@dnd-kit/abstract`** -- The framework-agnostic core of the drag-and-drop system. This package defines the fundamental abstractions:

- `Entity`, `Draggable`, `Droppable` -- the entity system
- `DragDropManager` -- the central orchestrator
- `DragOperation` -- state of an active drag
- `DragActions` -- the action interface (`start`, `move`, `stop`, `setDropTarget`)
- `Sensor` -- abstract input handling
- `Plugin` -- extensibility mechanism
- `Modifier` -- transform pipeline
- `CollisionObserver` / `CollisionNotifier` -- collision detection orchestration
- `DragDropMonitor` -- event dispatching
- `DragDropRegistry` -- entity and plugin lifecycle management

This package depends only on `@dnd-kit/state` and `@dnd-kit/geometry`.

### Platform Layer

**`@dnd-kit/dom`** -- DOM-specific implementation that extends `@dnd-kit/abstract` for browser environments. Provides:

- `DragDropManager` -- extends the abstract manager with a default preset of DOM plugins and sensors
- `Draggable` / `Droppable` -- extend abstract entities with DOM element references, feedback types, and position observation
- `PointerSensor` / `KeyboardSensor` -- concrete sensor implementations for mouse/touch/pen and keyboard input
- DOM plugins: `Feedback` (drag overlay and drop animation), `Accessibility` (ARIA live regions), `AutoScroller`, `Cursor`, `PreventSelection`, `ScrollListener`, `Scroller`

Dependencies: `@dnd-kit/abstract`, `@dnd-kit/collision`, `@dnd-kit/geometry`, `@dnd-kit/state`.

**`@dnd-kit/react`** -- React bindings that integrate `@dnd-kit/dom` with React's component model. Provides:

- `DragDropProvider` -- React context provider that creates and manages a `DragDropManager`
- `useDraggable` / `useDroppable` -- hooks that create and manage DOM entity instances within React's lifecycle
- `useDragOperation` -- hook to observe the current drag operation
- `useDragDropManager` / `useDragDropMonitor` -- hooks for accessing the manager and monitoring events

Dependencies: `@dnd-kit/abstract`, `@dnd-kit/dom`, `@dnd-kit/state`, plus peer dependencies on `react` and `react-dom`.

---

## Package Dependency Graph

```
@preact/signals-core
        |
  @dnd-kit/state
        |
  @dnd-kit/geometry
        |
  @dnd-kit/abstract  <----------+------------------+
   /    |     \                  |                  |
  /     |      \                 |                  |
 v      v       v                |                  |
collision  helpers               |                  |
  \                              |                  |
   +-----------------------------+                  |
                                 |                  |
                           @dnd-kit/dom             |
                                 |                  |
                                 +------------------+
                                 |
                           @dnd-kit/react
                                 |
                           react, react-dom
```

Reading the dependency from the bottom up:

| Package | Dependencies |
|---------|-------------|
| `@dnd-kit/state` | `@preact/signals-core` |
| `@dnd-kit/geometry` | `@dnd-kit/state` |
| `@dnd-kit/abstract` | `@dnd-kit/geometry`, `@dnd-kit/state` |
| `@dnd-kit/collision` | `@dnd-kit/abstract`, `@dnd-kit/geometry` |
| `@dnd-kit/helpers` | `@dnd-kit/abstract` |
| `@dnd-kit/dom` | `@dnd-kit/abstract`, `@dnd-kit/collision`, `@dnd-kit/geometry`, `@dnd-kit/state` |
| `@dnd-kit/react` | `@dnd-kit/abstract`, `@dnd-kit/dom`, `@dnd-kit/state` + `react`/`react-dom` |

---

## Core Concepts

### DragDropManager

The `DragDropManager` is the central orchestrator. It owns:

- **`registry`** (`DragDropRegistry`) -- manages the lifecycle of draggables, droppables, plugins, sensors, and modifiers via separate sub-registries
- **`dragOperation`** (`DragOperation`) -- the reactive state of the current drag operation (source, target, position, transform, status, shape)
- **`actions`** (`DragActions`) -- the imperative API for starting, moving, and stopping drag operations
- **`collisionObserver`** (`CollisionObserver`) -- reacts to drag position changes and computes collisions against registered droppables
- **`monitor`** (`DragDropMonitor`) -- event bus for dispatching and subscribing to drag-and-drop events (`beforedragstart`, `dragstart`, `dragmove`, `dragover`, `dragend`, `collision`)
- **`renderer`** (`Renderer`) -- abstraction for coordinating with the rendering framework (e.g., React's commit cycle)

### DragOperation

The `DragOperation` class holds the full mutable state of an active drag:

- `status` -- a reactive `Status` object tracking the operation through states: `Idle` -> `InitializationPending` -> `Initializing` -> `Dragging` -> `Dropped`
- `sourceIdentifier` / `targetIdentifier` -- reactive identifiers pointing into the registry
- `source` / `target` -- derived getters that resolve identifiers to entity instances
- `position` -- a `Position` (extending `ValueHistory<Point>`) tracking current, initial, and previous pointer coordinates, plus velocity and direction
- `shape` -- a `ValueHistory<Shape>` tracking the dragged element's bounding geometry
- `transform` -- a derived getter that applies all modifiers to `position.delta`
- `modifiers` -- the list of active `Modifier` instances

### Entity System

All draggable and droppable items inherit from the `Entity` base class:

```
Entity
  +-- Draggable (abstract)
  |     +-- dom/Draggable (adds element, handle, feedback)
  +-- Droppable (abstract)
        +-- dom/Droppable (adds element, shape observation)
```

Entities are identified by a `UniqueIdentifier` (string or number), carry arbitrary `data`, and can be `disabled`. They self-register with the manager's `EntityRegistry` on construction (via `queueMicrotask`) and support reactive effects that run while the entity is registered.

### Registries

- **`EntityRegistry<T>`** -- A reactive `Map<UniqueIdentifier, Entity>` backed by a signal. Handles registration, unregistration, and cleanup of entity effects.
- **`PluginRegistry<T>`** -- Maps plugin constructors to singleton instances. Handles creation, reconfiguration, and destruction. Core plugins cannot be unregistered.
- **`DragDropRegistry`** -- Aggregates `EntityRegistry` for draggables and droppables, and `PluginRegistry` for plugins, sensors, and modifiers.

---

## Data Flow: Lifecycle of a Drag Operation

The following describes the flow of a typical pointer-initiated drag operation using `@dnd-kit/dom` with `PointerSensor`.

### 1. Sensor Binding

When a `Draggable` is registered, its effects run. In the DOM layer, one of these effects iterates over the manager's sensors and calls `sensor.bind(draggable)`. For `PointerSensor`, this attaches a `pointerdown` event listener to the draggable's element (or its handle).

```
Draggable registers
  -> effects() run
    -> PointerSensor.bind(draggable) called
      -> pointerdown listener attached to element/handle
```

### 2. Activation

When the user presses down on a draggable element:

```
User pointerdown on draggable element
  -> PointerSensor.handlePointerDown()
    -> Checks: primary button, not disabled, not interactive element, idle status
    -> Records initialCoordinates
    -> Creates ActivationController with ActivationConstraints (delay, distance)
    -> Attaches pointermove / pointerup listeners to document
```

The `ActivationController` manages activation constraints. For example, on touch devices, a 250ms delay constraint must be satisfied before activation. On mouse with a handle, activation is immediate.

### 3. Drag Start

Once activation constraints are satisfied (or immediately if there are none):

```
ActivationController.activate()
  -> PointerSensor.handleStart()
    -> manager.actions.start({ coordinates, event, source })
      -> Sets sourceIdentifier on dragOperation
      -> Sets status to InitializationPending
      -> Dispatches 'beforedragstart' event (preventable)
      -> Sets status to Initializing
      -> After renderer.rendering resolves:
        -> Sets status to Dragging
        -> Dispatches 'dragstart' event (not cancelable)
```

The transition through `InitializationPending` -> `Initializing` -> `Dragging` allows the rendering framework (React) to commit DOM changes (like creating the drag overlay) before the drag is considered fully active.

### 4. Drag Move

As the pointer moves:

```
User pointermove
  -> PointerSensor.handlePointerMove()
    -> Computes coordinates with frame transform offsets
    -> Schedules manager.actions.move({ to: coordinates, event })
      -> Dispatches 'dragmove' event (preventable)
      -> Updates dragOperation.position.current
```

Position updates are scheduled via a `scheduler` to batch rapid pointer events and avoid redundant updates.

### 5. Collision Detection

The `CollisionObserver` runs as a reactive effect. When `dragOperation.position` changes, it automatically recomputes:

```
dragOperation.position changes (reactive)
  -> CollisionObserver.computeCollisions()
    -> Iterates all registered droppables
    -> Filters: not disabled, accepts the source type
    -> Calls each droppable's collisionDetector({ droppable, dragOperation })
    -> Sorts collisions by priority and value
    -> Updates collisions signal
```

### 6. Drop Target Resolution

The `CollisionNotifier` (a core plugin) watches the collision signal:

```
CollisionObserver.collisions changes (reactive)
  -> CollisionNotifier effect runs
    -> Dispatches 'collision' event (preventable)
    -> If top collision differs from current target:
      -> Disables collision observer temporarily
      -> Calls manager.actions.setDropTarget(firstCollision.id)
        -> Updates dragOperation.targetIdentifier
        -> Dispatches 'dragover' event (preventable)
        -> Waits for renderer.rendering
      -> Re-enables collision observer
```

This design prevents cyclic updates: the collision observer is disabled while the drop target is being set, preventing re-entry.

### 7. Drag End

When the user releases the pointer:

```
User pointerup
  -> PointerSensor.handlePointerUp()
    -> manager.actions.stop({ event, canceled: false })
      -> Aborts the operation's AbortController
      -> Dispatches 'dragend' event (with suspend capability)
      -> After renderer.rendering resolves:
        -> Sets status to Dropped
        -> Waits for drop animation (source.status === 'dropping' -> 'idle')
        -> Calls dragOperation.reset()
          -> Resets status to Idle
          -> Clears source, target, position, shape, modifiers
```

The `dragend` event exposes a `suspend()` function that consumers can call to delay the final cleanup, enabling custom drop animations.

### 8. Visual Feedback (DOM Layer)

The `Feedback` plugin (DOM layer) provides visual feedback throughout the drag:

- On drag initialization: captures element dimensions, creates a placeholder, applies fixed positioning styles, promotes element to the top layer via `popover`
- On drag move: updates CSS `translate` to reflect the current transform
- On drop: animates the element back to its final position, then cleans up styles and restores the original DOM structure

---

## Key Design Patterns

### Entity System

Entities (`Draggable`, `Droppable`) follow an object-oriented pattern where each entity is a class instance that:

1. Self-registers with a manager upon construction
2. Carries reactive state via `@reactive` decorated accessors
3. Exposes derived state via `@derived` decorated getters
4. Supports lifecycle effects that run while registered and clean up on unregistration

This pattern allows entities to be created imperatively (in vanilla JS) or declaratively (via React hooks like `useDraggable`).

### Plugin System

The plugin architecture is built on constructor-based registration:

```
Plugin (base class)
  +-- CorePlugin (built-in plugins that cannot be unregistered)
  +-- Sensor (abstract, adds bind() method)
  +-- Modifier (adds apply() method for transform pipeline)
```

Key characteristics:
- Plugins are registered by their constructor function, ensuring singletons within a manager
- Plugins can be configured via `Plugin.configure(options)` which returns a descriptor `{ plugin, options }`
- The `PluginRegistry` manages the lifecycle: instantiation, reconfiguration, and destruction
- Plugins use `registerEffect()` to attach reactive effects that auto-cleanup on destruction
- Plugins can be dynamically enabled/disabled via `enable()` / `disable()`

### Reactive State via Signals

The `@dnd-kit/state` package wraps `@preact/signals-core` with ergonomic TypeScript decorators and utilities:

**`@reactive` decorator** -- Applied to class accessor fields. Internally creates a signal and exposes it through standard getter/setter syntax. Reading the accessor subscribes to the signal; writing it updates the signal.

**`@derived` decorator** -- Applied to class getter methods. Internally creates a computed signal (memoized, lazily evaluated) that re-computes only when its reactive dependencies change.

**`effects()` function** -- Takes multiple effect callbacks and returns a single cleanup function. Effects automatically track signal dependencies and re-run when those dependencies change.

**`ValueHistory<T>`** -- A reactive container that tracks `current`, `initial`, and `previous` values. Used by `Position` and `DragOperation.shape` to maintain history during a drag.

**`batch()` function** -- Groups multiple signal updates into a single transaction, preventing intermediate re-computations.

**`untracked()` function** -- Reads signal values without creating a dependency, useful for accessing state in callbacks that should not trigger re-computation.

This signal-based reactivity eliminates the need for manual subscription management. When a `DragOperation`'s `position.current` changes, the `CollisionObserver`'s effect automatically re-runs because it reads from that signal. Similarly, derived properties like `transform` and `isDragging` automatically stay in sync.

### Event System

The `DragDropMonitor` implements a pub/sub event system with typed events:

- `beforedragstart` -- preventable, fires before initialization
- `dragstart` -- not cancelable, fires when dragging begins
- `dragmove` -- preventable, fires on each position update
- `dragover` -- preventable, fires when the drop target changes
- `collision` -- preventable, fires when collisions are detected
- `dragend` -- fires when the drag ends, supports `suspend()` for async cleanup

Events use a `Preventable<T>` wrapper that adds `preventDefault()` and `defaultPrevented` to event payloads, following the DOM event pattern.

### Renderer Abstraction

The `Renderer` interface provides a single property: `get rendering(): Promise<void>`. The abstract layer's default renderer resolves immediately. The React layer provides a custom renderer that resolves after React has committed its updates. This ensures that actions like `setDropTarget` wait for the UI to reflect changes before proceeding, preventing visual glitches.

### Modifier Pipeline

Modifiers form a transform pipeline. The `DragOperation.transform` getter iterates all active modifiers and applies them in sequence:

```typescript
get transform() {
  let transform = { x: position.delta.x, y: position.delta.y };
  for (const modifier of this.modifiers) {
    transform = modifier.apply({ ...this.snapshot(), transform });
  }
  return transform;
}
```

Each modifier receives the current operation snapshot (including the cumulative transform from previous modifiers) and returns new coordinates. This enables composable behaviors like grid snapping, axis locking, and boundary constraints.
