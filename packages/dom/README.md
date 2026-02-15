# @dnd-kit/dom

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/dom.svg)](https://npm.im/@dnd-kit/dom)

The framework-agnostic DOM implementation layer for **@dnd-kit**, built on top of `@dnd-kit/abstract`. This package provides the core drag and drop primitives that work directly with the DOM, and serves as the foundation for all framework adapters (`@dnd-kit/react`, `@dnd-kit/vue`, `@dnd-kit/svelte`, `@dnd-kit/solid`).

## Installation

```bash
npm install @dnd-kit/dom
```

## Overview

Most consumers will use one of the framework-specific adapters rather than this package directly. However, `@dnd-kit/dom` can be used standalone for framework-agnostic or vanilla JavaScript projects.

### Entry points

| Entry point              | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| `@dnd-kit/dom`           | Core API — `DragDropManager`, `Draggable`, `Droppable`, sensors, plugins |
| `@dnd-kit/dom/sortable`  | Sortable primitives — `Sortable`, sorting utilities                      |
| `@dnd-kit/dom/modifiers` | Built-in modifiers for constraining drag movement                        |
| `@dnd-kit/dom/utilities` | DOM utility functions                                                    |

### Key concepts

- **DragDropManager** — Orchestrates drag and drop operations, manages sensors, plugins, and collision detection.
- **Draggable** — Represents a draggable DOM element.
- **Droppable** — Represents a droppable DOM element.
- **Sensors** — Detect user input (pointer, keyboard) and translate it into drag operations.
- **Plugins** — Extend core behavior (feedback, auto-scrolling, accessibility, etc.).
- **Modifiers** — Transform drag coordinates to constrain or modify movement.

## Documentation

Visit [dndkit.com](https://dndkit.com) for full documentation, guides, and interactive examples.
