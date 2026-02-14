# @dnd-kit/geometry

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/geometry.svg)](https://npm.im/@dnd-kit/geometry)

Geometry types and utilities for **@dnd-kit**. Provides the spatial primitives used by collision detection, shape tracking, and coordinate calculations.

> **Note:** This is an internal package used by `@dnd-kit/abstract` and `@dnd-kit/dom`. You generally don't need to install or use it directly.

## Overview

### Types

- `Shape`, `Rectangle`, `BoundingRectangle` — Geometric shapes
- `Point`, `Position`, `Coordinates` — Spatial positioning
- `Distance`, `Axis`, `Axes`, `Alignment` — Measurement and layout

### Utilities

- `exceedsDistance(delta, distance)` — Check if a movement vector exceeds a threshold distance
