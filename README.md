<p align="center">
  <a href="https://dndkit.com">
    <img alt="@dnd-kit – the modern drag & drop toolkit for React" src=".github/assets/dnd-kit-hero-banner.svg">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dnd-kit/dom"><img src="https://img.shields.io/npm/v/@dnd-kit/dom.svg" alt="Stable release" /></a>
  <a href="https://github.com/clauderic/dnd-kit/blob/main/LICENSE"><img src="https://img.shields.io/github/license/clauderic/dnd-kit" alt="MIT License" /></a>
</p>

A modern, lightweight, performant, accessible and extensible drag and drop toolkit.

## Features

- **Framework agnostic core:** The architecture is built in layers — a framework-agnostic core (`@dnd-kit/abstract`), a DOM implementation (`@dnd-kit/dom`), and thin adapters for your framework of choice.
- **Supports a wide range of use cases:** lists, grids, multiple containers, nested contexts, variable sized items, virtualized lists, 2D games, and more.
- **Built-in support for multiple input methods:** Pointer, mouse, touch and keyboard sensors.
- **Fully customizable & extensible:** Customize every detail — animations, transitions, behaviours, styles. Build your own sensors, collision detection algorithms, customize key bindings and more.
- **Accessibility:** Keyboard support, sensible default ARIA attributes, customizable screen reader instructions and live regions built-in.
- **Performance:** Built with performance in mind to support silky smooth animations.
- **Sortable:** Need to build a sortable interface? Check out `@dnd-kit/dom/sortable`, a thin layer built on top of the core.

## Packages

### Framework adapters

Pick the adapter for your framework:

| Package | Version | Description |
|---|---|---|
| [`@dnd-kit/react`](packages/react) | [![npm](https://img.shields.io/npm/v/@dnd-kit/react.svg)](https://npm.im/@dnd-kit/react) | React hooks and components |
| [`@dnd-kit/vue`](packages/vue) | [![npm](https://img.shields.io/npm/v/@dnd-kit/vue.svg)](https://npm.im/@dnd-kit/vue) | Vue composables and components |
| [`@dnd-kit/svelte`](packages/svelte) | [![npm](https://img.shields.io/npm/v/@dnd-kit/svelte.svg)](https://npm.im/@dnd-kit/svelte) | Svelte 5 primitives and components |
| [`@dnd-kit/solid`](packages/solid) | [![npm](https://img.shields.io/npm/v/@dnd-kit/solid.svg)](https://npm.im/@dnd-kit/solid) | SolidJS hooks and components |

### Core

| Package | Version | Description |
|---|---|---|
| [`@dnd-kit/dom`](packages/dom) | [![npm](https://img.shields.io/npm/v/@dnd-kit/dom.svg)](https://npm.im/@dnd-kit/dom) | Framework-agnostic DOM implementation |
| [`@dnd-kit/abstract`](packages/abstract) | [![npm](https://img.shields.io/npm/v/@dnd-kit/abstract.svg)](https://npm.im/@dnd-kit/abstract) | Abstract core — entities, sensors, plugins, modifiers |
| [`@dnd-kit/helpers`](packages/helpers) | [![npm](https://img.shields.io/npm/v/@dnd-kit/helpers.svg)](https://npm.im/@dnd-kit/helpers) | Helper functions (`move`, `swap`, etc.) |
| [`@dnd-kit/state`](packages/state) | [![npm](https://img.shields.io/npm/v/@dnd-kit/state.svg)](https://npm.im/@dnd-kit/state) | Internal reactive state management |
| [`@dnd-kit/geometry`](packages/geometry) | [![npm](https://img.shields.io/npm/v/@dnd-kit/geometry.svg)](https://npm.im/@dnd-kit/geometry) | Geometry types and spatial utilities |
| [`@dnd-kit/collision`](packages/collision) | [![npm](https://img.shields.io/npm/v/@dnd-kit/collision.svg)](https://npm.im/@dnd-kit/collision) | Collision detection algorithms |

## Quick start

Install the adapter for your framework:

```bash
npm install @dnd-kit/react      # React
npm install @dnd-kit/vue        # Vue
npm install @dnd-kit/svelte     # Svelte
npm install @dnd-kit/solid      # SolidJS
npm install @dnd-kit/dom        # Vanilla / framework-agnostic
```

## Documentation

Visit **[next.dndkit.com](https://next.dndkit.com)** for full documentation, API reference, guides, and interactive examples.

## Contributing

This is a monorepo managed with [Turborepo](https://turbo.build/) and [bun](https://bun.sh/).

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run dev mode
bun run dev
```

## License

MIT
