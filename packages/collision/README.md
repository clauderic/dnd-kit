# @dnd-kit/collision

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/collision.svg)](https://npm.im/@dnd-kit/collision)

Collision detection algorithms for @dnd-kit. This package provides a collection of strategies for determining which droppable target a dragged item is colliding with during a drag operation. Each algorithm implements the `CollisionDetector` interface defined by `@dnd-kit/abstract`.

## Installation

```
npm install @dnd-kit/collision
```

## Key Exports

### Types

- **`CollisionDetector`** -- The function signature for collision detection algorithms (re-exported from `@dnd-kit/abstract`). Each detector receives the current drag operation state and a droppable target, and returns a `Collision` object or `null`.

### Algorithms

- **`defaultCollisionDetection`** -- The recommended general-purpose algorithm. It first attempts `pointerIntersection` (checking if the pointer is inside a droppable). If no pointer intersection is found, it falls back to `shapeIntersection` (checking if the drag shape overlaps a droppable shape).

- **`pointerIntersection`** -- A high-precision algorithm that checks whether the pointer coordinates fall within a droppable's shape. When multiple droppables contain the pointer, they are ranked by the distance from the pointer to the droppable's center (closer is higher priority). Returns `null` if the pointer is outside the droppable.

- **`shapeIntersection`** -- Detects collisions based on the overlapping area between the dragged item's shape and the droppable's shape. The collision value is derived from both the intersection ratio and the distance from the droppable's center to the pointer, which helps avoid cyclic collision flicker.

- **`closestCenter`** -- First checks for pointer/shape intersection via `defaultCollisionDetection`. If no intersection is found, it measures the distance between the center of the droppable and the center of the drag shape (or the pointer position), returning the droppable with the shortest distance.

- **`closestCorners`** -- Measures the average distance between the four corners of the drag shape and the four corners of each droppable shape. Useful when corner alignment matters more than center alignment.

- **`pointerDistance`** -- A simple distance-based algorithm that measures the distance between the pointer position and the center of each droppable shape. The droppable with the shortest distance wins. Unlike `pointerIntersection`, this algorithm always returns a collision (it does not require the pointer to be inside the droppable).

- **`directionBiased`** -- Filters candidates based on the current direction of movement. Only droppables that lie in the direction the user is dragging (up, down, left, or right) are considered. Among those, the closest to the drag shape's center is selected. Falls back to `defaultCollisionDetection` when direction is not yet determined.

## Usage

```ts
import {closestCenter, pointerIntersection} from '@dnd-kit/collision';

// Pass a collision detector when configuring your DragDropManager
// or as a prop on a droppable:

// Using the default algorithm (recommended for most cases)
import {defaultCollisionDetection} from '@dnd-kit/collision';

// Or choose a specific algorithm for specialized behavior
import {directionBiased} from '@dnd-kit/collision';
```

You can also compose your own collision detector by implementing the `CollisionDetector` interface and combining the built-in algorithms.

## Dependencies

- `@dnd-kit/abstract` -- Provides the `CollisionDetector` type, `CollisionPriority`, and `CollisionType` enums.
- `@dnd-kit/geometry` -- Provides `Point` and `Rectangle` classes used for spatial calculations.

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com) to learn more about collision detection in dnd-kit.
