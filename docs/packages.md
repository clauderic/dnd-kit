# Package Reference

This document provides a comprehensive reference for all published packages in the @dnd-kit monorepo. The dnd-kit toolkit is organized as a layered architecture: low-level foundation packages (`state`, `geometry`) feed into an abstract core (`abstract`), which is then specialized into platform-specific implementations (`dom`, `react`), with supporting packages (`collision`, `helpers`) providing additional functionality.

---

## Published Packages

### @dnd-kit/state

**Purpose:** Reactive state management primitives for dnd-kit. This is the lowest-level package in the dependency graph and has no dependency on any other `@dnd-kit` package.

**Key Exports:**

- `signal`, `Signal`, `ReadonlySignal`, `batch`, `effect`, `untracked` -- Re-exported from `@preact/signals-core`.
- `computed(fn, comparator?)` -- Creates a computed signal with optional custom equality checking.
- `@reactive` -- Class accessor decorator that backs a property with a signal.
- `@derived` -- Class getter decorator that memoizes the getter as a computed signal.
- `@enumerable(boolean?)` -- Decorator to control property enumerability.
- `effects(...fns)` -- Register multiple effects, returning a single cleanup function.
- `deepEqual(a, b)` -- Recursive deep equality comparator.
- `snapshot(value)` -- Creates a non-reactive shallow copy of a reactive object.
- `ValueHistory<T>` -- Tracks `current`, `initial`, and `previous` values of a reactive property.
- `WeakStore` -- A `WeakMap`-backed two-level store.

**Dependencies:** `@preact/signals-core`

**Typical Usage:** Used internally by nearly all other dnd-kit packages. You would use this package directly if you are building custom plugins, sensors, or modifiers that need reactive state.

---

### @dnd-kit/geometry

**Purpose:** Geometry primitives and spatial utilities. Provides the types, classes, and functions for representing shapes, points, coordinates, and distances used throughout the dnd-kit system -- particularly for collision detection.

**Key Exports:**

- `Rectangle` -- A 2D rectangle shape with methods for intersection, containment, translation, and derived properties (center, area, corners, aspect ratio, bounding rectangle). Includes static methods `from()`, `delta()`, and `intersectionRatio()`.
- `Point` -- A 2D point with static methods `delta()`, `distance()`, `equals()`, and `from()`.
- `Position` -- Extends `ValueHistory<Point>` to track a point over time with `delta`, `direction`, and `velocity`.
- `Shape` (abstract) -- Base class that all shapes implement for collision detection.
- `Axis` enum, `Axes` constant, `Coordinates`, `BoundingRectangle`, `Alignment`, `Distance` types.
- `exceedsDistance(coordinates, distance)` -- Checks if coordinates exceed a distance threshold.

**Dependencies:** `@dnd-kit/state`

**Typical Usage:** Used by `@dnd-kit/abstract` and `@dnd-kit/collision` for all spatial calculations. You would use this package directly when implementing custom collision detection algorithms or working with shape geometry.

---

### @dnd-kit/abstract

**Purpose:** The framework-agnostic abstract core of dnd-kit. Defines the foundational abstractions for drag and drop: the manager, entities (draggable/droppable), sensors, plugins, modifiers, and collision detection interfaces. Concrete implementations like `@dnd-kit/dom` extend these abstractions for specific platforms.

**Key Exports:**

- `DragDropManager` -- The central orchestrator that manages drag operations, entities, sensors, and plugins.
- `DragOperationStatus` -- Enum representing the current state of a drag operation.
- `Draggable`, `Droppable` -- Base entity classes for draggable and droppable elements.
- `Sensor`, `ActivationConstraint`, `ActivationController` -- Base classes and utilities for input sensors.
- `Plugin`, `PluginRegistry`, `CorePlugin`, `configure`, `configurator`, `descriptor` -- Plugin system infrastructure.
- `Modifier` -- Abstract base class for drag operation modifiers.
- `CollisionPriority`, `CollisionType`, `sortCollisions` -- Collision detection primitives.
- Types: `Collision`, `CollisionDetector`, `DragDropManagerInput`, `DragActions`, `DragDropEvents`, `DragOperation`, `UniqueIdentifier`, `Data`, `Type`, and more.
- Modifiers sub-export (`@dnd-kit/abstract/modifiers`): `AxisModifier`, `RestrictToHorizontalAxis`, `RestrictToVerticalAxis`, `restrictShapeToBoundingRectangle`, `SnapModifier`.

**Dependencies:** `@dnd-kit/geometry`, `@dnd-kit/state`

**Typical Usage:** Most consumers do not use this package directly. It is the foundation for `@dnd-kit/dom` and `@dnd-kit/react`. You would depend on it directly only if you are building a new platform implementation layer or need to extend core abstractions.

---

### @dnd-kit/collision

**Purpose:** A collection of collision detection algorithms that implement the `CollisionDetector` interface from `@dnd-kit/abstract`. These algorithms determine which droppable target a dragged item is interacting with.

**Key Exports:**

- `CollisionDetector` type (re-exported from `@dnd-kit/abstract`).
- `defaultCollisionDetection` -- General-purpose algorithm: tries `pointerIntersection`, then falls back to `shapeIntersection`.
- `pointerIntersection` -- High-precision check: is the pointer inside the droppable?
- `shapeIntersection` -- Checks overlap area between the drag shape and droppable shape.
- `closestCenter` -- Falls back to center-to-center distance when no intersection is found.
- `closestCorners` -- Measures average corner-to-corner distance.
- `pointerDistance` -- Simple pointer-to-center distance (always returns a collision).
- `directionBiased` -- Only considers droppables in the current drag direction.

**Dependencies:** `@dnd-kit/abstract`, `@dnd-kit/geometry`

**Typical Usage:** Pass a collision detector to the `DragDropManager` or to individual droppable configurations. The `defaultCollisionDetection` algorithm works well for most scenarios. Use specialized algorithms like `directionBiased` or `closestCorners` for specific interaction patterns (e.g., keyboard-driven reordering or grid layouts).

---

### @dnd-kit/helpers

**Purpose:** Convenience utilities for common drag and drop patterns, particularly array reordering and swapping in response to drag events.

**Key Exports:**

- `move(items, event)` -- Reorders items (flat array or grouped record) based on a drag event. Handles cross-group transfers.
- `swap(items, event)` -- Swaps items instead of shifting them. Supports the same data structures as `move`.
- `arrayMove(array, from, to)` -- Low-level: returns a new array with one item moved.
- `arraySwap(array, from, to)` -- Low-level: returns a new array with two items swapped.

**Dependencies:** `@dnd-kit/abstract`

**Typical Usage:** Call `move()` or `swap()` inside `onDragOver` or `onDragEnd` event handlers to update your item arrays in response to drag operations. The low-level `arrayMove` and `arraySwap` functions are useful when you need more control over the reordering logic.

---

### @dnd-kit/dom

**Purpose:** The DOM implementation layer for dnd-kit. Extends the abstract core with concrete DOM-aware implementations of draggables, droppables, sensors, and plugins. This is the primary package for vanilla JavaScript or framework-agnostic DOM-based drag and drop.

**Key Exports:**

- `DragDropManager`, `defaultPreset` -- DOM-specific manager with built-in plugins.
- `Draggable`, `Droppable` -- DOM-aware entity classes with element binding.
- `PointerSensor`, `KeyboardSensor` -- Input sensors for pointer (mouse/touch) and keyboard interactions.
- `PointerActivationConstraints` -- Configurable activation constraints for the pointer sensor.
- Plugins: `Accessibility`, `AutoScroller`, `Cursor`, `Feedback`, `PreventSelection`, `Scroller`, `ScrollListener`.
- Sub-exports:
  - `@dnd-kit/dom/sortable`: `Sortable`, `isSortable`, `OptimisticSortingPlugin`, `SortableKeyboardPlugin`, `defaultSortableTransition`.
  - `@dnd-kit/dom/modifiers`: DOM-specific modifiers.
  - `@dnd-kit/dom/utilities`: Internal DOM utilities.
  - `@dnd-kit/dom/plugins/*`: Optional plugins like the debug plugin.

**Dependencies:** `@dnd-kit/abstract`, `@dnd-kit/collision`, `@dnd-kit/geometry`, `@dnd-kit/state`

**Typical Usage:** Use this package when building drag and drop interfaces without React, or when you need direct DOM-level control. For React applications, prefer `@dnd-kit/react` which wraps this package with React-specific bindings.

---

### @dnd-kit/react

**Purpose:** The React integration layer for dnd-kit. Provides React hooks and components that wrap `@dnd-kit/dom` with idiomatic React APIs including context providers, hooks for draggable/droppable elements, and a drag overlay component.

**Key Exports:**

- `DragDropProvider` -- React context provider that initializes and manages a `DragDropManager`.
- `useDraggable(input)` -- Hook to make an element draggable.
- `useDroppable(input)` -- Hook to make an element a drop target.
- `DragOverlay` -- A React component for rendering a custom drag overlay.
- `useDragDropManager()` -- Hook to access the underlying `DragDropManager` instance.
- `useDragDropMonitor(handlers)` -- Hook to listen to drag and drop events.
- `useDragOperation()` -- Hook to access the current drag operation state.
- `useInstance()` -- Hook for accessing entity instances.
- `PointerSensor`, `KeyboardSensor` -- Re-exported from `@dnd-kit/dom`.
- Sub-exports:
  - `@dnd-kit/react/sortable`: `useSortable(input)`, `isSortable`.
  - `@dnd-kit/react/hooks`: Additional hooks.
  - `@dnd-kit/react/utilities`: Internal React utilities.

**Dependencies:** `@dnd-kit/abstract`, `@dnd-kit/dom`, `@dnd-kit/state`

**Peer Dependencies:** `react` (^18.0.0 || ^19.0.0), `react-dom` (^18.0.0 || ^19.0.0)

**Typical Usage:** This is the primary entry point for React applications. Install `@dnd-kit/react` along with `@dnd-kit/collision` and `@dnd-kit/helpers` for a complete drag and drop solution.

---

## Dependency Graph

The packages form a layered dependency graph:

```
@dnd-kit/state            (no @dnd-kit dependencies)
    |
@dnd-kit/geometry         (depends on state)
    |
@dnd-kit/abstract         (depends on geometry, state)
   / | \
  /  |  \
collision helpers  dom    (depend on abstract and/or geometry)
                    |
                  react   (depends on abstract, dom, state)
```

---

## Non-Published Package Directories

The following directories exist in the `packages/` folder but do not have `package.json` files and are not published to npm. They are legacy or internal directories from earlier versions of dnd-kit that have since been consolidated into the published packages above:

- **`accessibility`** -- Accessibility functionality is now part of `@dnd-kit/dom` (the `Accessibility` plugin).
- **`core`** -- The original core package has been superseded by `@dnd-kit/abstract`.
- **`modifiers`** -- Modifiers are now included as sub-exports of `@dnd-kit/abstract/modifiers` and `@dnd-kit/dom/modifiers`.
- **`sortable`** -- Sortable functionality is now a sub-export of `@dnd-kit/dom/sortable` and `@dnd-kit/react/sortable`.
- **`types`** -- Types have been co-located within the packages that define them.
- **`utilities`** -- Utilities have been distributed into `@dnd-kit/helpers`, `@dnd-kit/dom/utilities`, and `@dnd-kit/react/utilities`.
- **`positionobserver`** -- Position observation is now handled internally within `@dnd-kit/dom`.
- **`config-eslint` / `eslint-config`** -- Internal ESLint configuration, not published as a user-facing package.

These directories should not be depended on directly. Use the published packages listed above instead.

---

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com) for full documentation, guides, and examples.
