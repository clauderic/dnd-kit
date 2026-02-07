# AGENTS.md -- dnd-kit

This file provides orientation for AI agents (and human contributors) working on the dnd-kit codebase. It serves as a table of contents pointing to detailed documentation.

## Project Overview

dnd-kit is a modular, framework-agnostic drag-and-drop toolkit. It is organized as a monorepo with a layered architecture that separates concerns across packages:

```
                  @dnd-kit/react          <-- React bindings (hooks, context, components)
                       |
                  @dnd-kit/dom            <-- DOM implementation (sensors, plugins, sortable)
                       |
                 @dnd-kit/abstract        <-- Framework-agnostic core (entities, manager, sensors, plugins)
                  /    |     \
    @dnd-kit/collision |  @dnd-kit/helpers
                  \    |     /
              @dnd-kit/geometry
                       |
                 @dnd-kit/state           <-- Reactive signals (wraps @preact/signals-core)
```

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `bun install` |
| Build all packages | `bun run build` |
| Development mode | `bun run dev` |
| Run tests | `bun run test` |
| Lint | `bun run lint` |
| Format | `bun run format` |
| Add a changeset | `bun run changeset` |

**Primary branch:** `experimental` (not `master`)
**Package manager:** Bun (v1.1.12+)
**Build orchestrator:** Turborepo
**Build tool:** tsup (ESM + CJS dual output)
**Test runner:** Bun test
**Versioning:** Changesets (fixed versioning -- all packages share the same version)

## Detailed Documentation

### [Architecture](docs/architecture.md)
Layered architecture, package dependency graph, core concepts (DragDropManager, DragOperation, Entity System, Registry), complete data flow of a drag operation lifecycle, and key design patterns (Entity System, Plugin System, Reactive State, Event System, Renderer Abstraction, Modifier Pipeline).

### [Code Patterns](docs/code-patterns.md)
Key abstractions with type signatures (Entity, Draggable, Droppable, DragDropManager, Sensor, Plugin, Modifier, CollisionDetector), reactive state management details (@reactive/@derived decorators, signals, computed, effects), extensibility patterns with code examples (custom sensors, plugins, collision algorithms, modifiers), and naming conventions.

### [Development Guide](docs/development.md)
Prerequisites, development setup, build system details, testing, linting/formatting, CI/CD pipelines (Tests, Release, Continuous Release, Chromatic), release process (Changesets), project structure, and common tasks.

### [Package Reference](docs/packages.md)
Comprehensive reference for all 7 published packages with their purposes, key exports, dependencies, and typical usage context. Also documents non-published/legacy package directories.

## Package Map

| Package | Role | Path |
|---------|------|------|
| [`@dnd-kit/state`](packages/state/README.md) | Reactive state primitives (signals, decorators) | `packages/state/` |
| [`@dnd-kit/geometry`](packages/geometry/README.md) | Geometric primitives (shapes, points, distances) | `packages/geometry/` |
| [`@dnd-kit/collision`](packages/collision/README.md) | Collision detection algorithms | `packages/collision/` |
| [`@dnd-kit/helpers`](packages/helpers/README.md) | Array manipulation utilities for drag events | `packages/helpers/` |
| [`@dnd-kit/abstract`](packages/abstract/README.md) | Framework-agnostic DnD core | `packages/abstract/` |
| [`@dnd-kit/dom`](packages/dom/README.md) | DOM implementation layer | `packages/dom/` |
| [`@dnd-kit/react`](packages/react/README.md) | React integration layer | `packages/react/` |

## Key Concepts for Contributors

1. **Reactivity drives everything.** The `@reactive` and `@derived` decorators from `@dnd-kit/state` make properties automatically tracked. Collision detection, drag feedback, and UI updates are all driven by reactive effects -- not imperative callbacks.

2. **Three-layer extension model.** `abstract` defines the interfaces, `dom` provides concrete DOM implementations, `react` wraps them in React hooks/context. When modifying behavior, identify which layer owns it.

3. **Plugin architecture.** Most DOM-level features (scrolling, accessibility, drag feedback, cursor management) are implemented as plugins, not hardcoded in the manager. See `packages/dom/src/core/plugins/`.

4. **Collision detection is pluggable.** Algorithms are pure functions of type `CollisionDetector`. The `defaultCollisionDetection` composes multiple algorithms with priority-based resolution.

5. **Fixed versioning.** All packages are released together at the same version number via Changesets.

## Apps

| App | Purpose | Path |
|-----|---------|------|
| Stories | Storybook-based demos and visual testing | `apps/stories/` |
| Docs | Mintlify-powered documentation site | `apps/docs/` |
