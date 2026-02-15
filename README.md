<p align="center">
  <a href="https://dndkit.com">
    <img alt="@dnd-kit – the modern toolkit for building drag & drop interfaces" src=".github/assets/dnd-kit-hero-banner.svg">
  </a>
</p>
<p align="center">
A modern, lightweight, performant, accessible and extensible drag and drop toolkit for the web
</p>

## Features

- **Framework agnostic core:** The architecture is built in layers — a framework-agnostic core (`@dnd-kit/abstract`), a DOM implementation (`@dnd-kit/dom`), and thin adapters for your framework of choice.
- **Supports a wide range of use cases:** lists, grids, multiple containers, nested contexts, variable sized items, virtualized lists, 2D games, and more.
- **Built-in support for multiple input methods:** Pointer, mouse, touch and keyboard sensors.
- **Fully customizable & extensible:** Customize every detail — animations, transitions, behaviours, styles. Build your own sensors, collision detection algorithms, customize key bindings and more.
- **Accessibility:** Keyboard support, sensible default ARIA attributes, customizable screen reader instructions and live regions built-in.
- **Performance:** Built with performance in mind to support silky smooth animations.
- **Sortable:** Need to build a sortable interface? Check out `@dnd-kit/dom/sortable`, a thin layer built on top of the core.

<h2 align="left">Getting started</h2>

<p>
Choose your preferred framework to get started:
</p>

<br>

<table width="100%" cellpadding="32">
<tr>
<td width="50%" valign="top">
<br>
<img src="https://cdn.simpleicons.org/javascript/F7DF1E" height="22" alt="JavaScript" />
<br>

<strong><a href="https://docs.dndkit.com/quickstart">Vanilla</a></strong>

Build drag and drop interfaces using plain JavaScript
<br>
</td>

<td width="50%" valign="top">
<br>
<img src="https://cdn.simpleicons.org/react/61DAFB" height="22" alt="React" />
<br>

<strong><a href="https://docs.dndkit.com/react/quickstart">React</a></strong>

Build drag and drop interfaces using React components and hooks
<br><br>
</td>
</tr>

<tr>
<td width="50%" valign="top">
<br>
<img src="https://cdn.simpleicons.org/vue.js/4FC08D" height="22" alt="Vue" />
<br>

<strong><a href="https://docs.dndkit.com/vue/quickstart">Vue</a></strong>

Build drag and drop interfaces using Vue composables and components
<br><br>
</td>

<td width="50%" valign="top">
<br>
<img src="https://cdn.simpleicons.org/svelte/FF3E00" height="22" alt="Svelte" />
<br>

<strong><a href="https://docs.dndkit.com/svelte/quickstart">Svelte</a></strong>

Build drag and drop interfaces using Svelte primitives and components
<br><br>
</td>
</tr>

<tr>
<td width="50%" valign="top">
<br>
<img src="https://cdn.simpleicons.org/solid/2C4F7C" height="22" alt="SolidJS" />
<br>

<strong><a href="https://docs.dndkit.com/solid/quickstart">Solid</a></strong>

Build drag and drop interfaces using SolidJS hooks and components
<br><br>
</td>

<td width="50%" valign="top">
</td>
</tr>
</table>

## Documentation

Visit **[docs.dndkit.com](https://docs.dndkit.com)** for full documentation, API reference, guides, and interactive examples.

## Packages

| Package | Version | Description |
|---|---|---|
| [`@dnd-kit/abstract`](packages/abstract) | [![npm](https://img.shields.io/npm/v/@dnd-kit/abstract.svg)](https://npm.im/@dnd-kit/abstract) | Abstract core |
| [`@dnd-kit/collision`](packages/collision) | [![npm](https://img.shields.io/npm/v/@dnd-kit/collision.svg)](https://npm.im/@dnd-kit/collision) | Collision detection |
| [`@dnd-kit/dom`](packages/dom) | [![npm](https://img.shields.io/npm/v/@dnd-kit/dom.svg)](https://npm.im/@dnd-kit/dom) | Framework-agnostic DOM layer |
| [`@dnd-kit/geometry`](packages/geometry) | [![npm](https://img.shields.io/npm/v/@dnd-kit/geometry.svg)](https://npm.im/@dnd-kit/geometry) | Geometry utilities |
| [`@dnd-kit/helpers`](packages/helpers) | [![npm](https://img.shields.io/npm/v/@dnd-kit/helpers.svg)](https://npm.im/@dnd-kit/helpers) | Helper functions |
| [`@dnd-kit/react`](packages/react) | [![npm](https://img.shields.io/npm/v/@dnd-kit/react.svg)](https://npm.im/@dnd-kit/react) | React adapter |
| [`@dnd-kit/solid`](packages/solid) | [![npm](https://img.shields.io/npm/v/@dnd-kit/solid.svg)](https://npm.im/@dnd-kit/solid) | SolidJS adapter |
| [`@dnd-kit/state`](packages/state) | [![npm](https://img.shields.io/npm/v/@dnd-kit/state.svg)](https://npm.im/@dnd-kit/state) | Reactive state management |
| [`@dnd-kit/svelte`](packages/svelte) | [![npm](https://img.shields.io/npm/v/@dnd-kit/svelte.svg)](https://npm.im/@dnd-kit/svelte) | Svelte adapter |
| [`@dnd-kit/vue`](packages/vue) | [![npm](https://img.shields.io/npm/v/@dnd-kit/vue.svg)](https://npm.im/@dnd-kit/vue) | Vue adapter |


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

[MIT](./LICENSE)
