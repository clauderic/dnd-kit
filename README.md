<p align="center">
  <a href="https://dndkit.com">
    <img alt="@dnd-kit – the modern drag & drop toolkit for React" src=".github/assets/dnd-kit-hero-banner.svg">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dnd-kit/react"><img src="https://img.shields.io/npm/v/@dnd-kit/react.svg" alt="npm version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/@dnd-kit/react.svg" alt="MIT License"></a>
</p>

<p align="center">
A lightweight, performant, and extensible drag & drop toolkit for the web.
</p>

---

## Features

- **Framework agnostic** -- Built on a framework-agnostic core (`@dnd-kit/abstract`) with ready-made implementations for **vanilla JavaScript** and **React**.
- **Rich use cases** -- Sortable lists, grids, multiple containers, nested contexts, variable-sized items, virtualized lists, trees, and more.
- **Multiple input methods** -- Pointer, mouse, touch, and keyboard sensors with configurable activation constraints.
- **Pluggable collision detection** -- Ships with algorithms like closest center, pointer intersection, direction-biased, and more. Write your own in a few lines.
- **Plugin architecture** -- Auto-scrolling, drag feedback, accessibility announcements, and cursor management are all plugins. Swap them, configure them, or write your own.
- **Accessibility** -- Keyboard support, sensible ARIA attributes, customizable screen reader announcements, and live regions built-in.
- **Performance** -- Reactive, signal-based engine designed for silky smooth animations with minimal re-renders.
- **TypeScript first** -- Written in TypeScript with full type coverage.

## Quick start

### React

Install the packages:

```sh
npm install @dnd-kit/react @dnd-kit/helpers
```

Build a sortable list in under 30 lines:

```tsx
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

function SortableList() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      {items.map((id, index) => (
        <Sortable key={id} id={id} index={index} />
      ))}
    </DragDropProvider>
  );
}

function Sortable({id, index}: {id: number; index: number}) {
  const {ref} = useSortable({id, index});

  return <div ref={ref}>Item {id}</div>;
}
```

### Vanilla JavaScript

Install the package:

```sh
npm install @dnd-kit/dom
```

The `Sortable` class includes an `OptimisticSortingPlugin` by default that automatically reorders DOM elements during drag operations:

```js
import {DragDropManager} from '@dnd-kit/dom';
import {Sortable} from '@dnd-kit/dom/sortable';

const manager = new DragDropManager();

const elements = document.querySelectorAll('.sortable-item');

elements.forEach((element, index) => {
  new Sortable({id: element.id, index, element}, manager);
});
```

## Packages

| Package | Description |
|---------|-------------|
| [`@dnd-kit/abstract`](packages/abstract) | Framework-agnostic core -- entities, sensors, plugins, collision detection |
| [`@dnd-kit/dom`](packages/dom) | Vanilla JavaScript implementation for the DOM |
| [`@dnd-kit/react`](packages/react) | React hooks and components (`useDraggable`, `useDroppable`, `useSortable`) |
| [`@dnd-kit/collision`](packages/collision) | Collision detection algorithms |
| [`@dnd-kit/helpers`](packages/helpers) | Convenience utilities for common operations (`move`, `swap`) |
| [`@dnd-kit/geometry`](packages/geometry) | Geometric primitives (shapes, points, distances) |
| [`@dnd-kit/state`](packages/state) | Reactive state primitives powered by signals |

## Documentation

Read the full documentation at **[dndkit.com](https://dndkit.com)**.

## Examples

Explore interactive examples in the [Storybook](https://experimental--5fc05e08a4a65d0021ae0bf2.chromatic.com/).

<p align="center">
  <img alt="Storybook examples" src=".github/assets/storybook-screenshot.png" width="640">
</p>

## Community

- [Slack](https://dnd-kit.slack.com/) -- Join the community for questions and discussion
- [GitHub Issues](https://github.com/clauderic/dnd-kit/issues) -- Report bugs or request features
- [Twitter / X](https://x.com/dndkit) -- Follow for updates

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) to get started.

```sh
git clone https://github.com/clauderic/dnd-kit.git
cd dnd-kit
bun install
bun run dev
```

## License

MIT -- see [LICENSE](LICENSE) for details.
