# @dnd-kit/geometry

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/geometry.svg)](https://npm.im/@dnd-kit/geometry)

Geometry primitives and utilities for @dnd-kit. This package provides the foundational types and classes for representing shapes, points, coordinates, and distances used throughout the dnd-kit ecosystem -- particularly for collision detection and spatial calculations.

## Installation

```
npm install @dnd-kit/geometry
```

## Key Exports

### Classes

- **`Rectangle`** -- A 2D rectangle shape with methods for intersection testing, containment checks, translation, and computing derived values such as center, area, corners, and aspect ratio. Includes static helpers like `Rectangle.from(boundingRect)`, `Rectangle.delta(a, b, alignment)`, and `Rectangle.intersectionRatio(a, b)`.
- **`Point`** -- Represents a location in a 2D coordinate system (`x`, `y`). Provides static methods `Point.delta()`, `Point.distance()`, `Point.equals()`, and `Point.from()`.
- **`Position`** -- Extends `ValueHistory<Point>` to track a point over time, including `current`, `initial`, `previous`, `delta`, `direction`, and `velocity`.

### Abstract Classes

- **`Shape`** -- An abstract base class for 2D shapes used in collision detection. Defines the interface all shapes must implement: `boundingRectangle`, `center`, `area`, `scale`, `inverseScale`, `aspectRatio`, `equals()`, `intersectionArea()`, and `containsPoint()`.

### Types

- **`Coordinates`** -- A record mapping axes to numbers: `{ x: number; y: number }`.
- **`BoundingRectangle`** -- An interface with `width`, `height`, `left`, `right`, `top`, and `bottom` properties.
- **`Alignment`** -- Describes alignment along each axis: `{ x: Align; y: Align }` where `Align` is `'center' | 'start' | 'end'`.
- **`Distance`** -- A flexible distance type: either a single `number`, a `Coordinates` pair, or a partial coordinates object with just `x` or `y`.

### Enums and Constants

- **`Axis`** -- An enum with `Horizontal = 'x'` and `Vertical = 'y'`.
- **`Axes`** -- An array of all axis values: `['x', 'y']`.

### Functions

- **`exceedsDistance(coordinates, distance)`** -- Returns `true` if the given relative coordinates exceed the specified distance threshold. Supports numeric, single-axis, and two-axis distance constraints.

## Usage

```ts
import {Point, Rectangle} from '@dnd-kit/geometry';

// Create a rectangle and check if a point is inside it
const rect = new Rectangle(0, 0, 100, 50);
const point = new Point(25, 25);

rect.containsPoint(point); // true
rect.center; // Point { x: 50, y: 25 }
rect.area; // 5000

// Measure the distance between two points
Point.distance(new Point(0, 0), new Point(3, 4)); // 5

// Compute the intersection ratio between two rectangles
const a = new Rectangle(0, 0, 100, 100);
const b = new Rectangle(50, 50, 100, 100);
a.intersectionRatio(b); // ratio of overlapping area
```

## Dependencies

This package depends on `@dnd-kit/state` for reactive state primitives (used internally by the `Position` class).

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com) to learn more about dnd-kit and how geometry primitives fit into the larger drag and drop system.
