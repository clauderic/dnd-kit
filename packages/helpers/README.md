# @dnd-kit/helpers

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/helpers.svg)](https://npm.im/@dnd-kit/helpers)

Framework-agnostic helper functions for **@dnd-kit**. Provides utilities for common data transformations in drag and drop interactions.

## Installation

```bash
npm install @dnd-kit/helpers
```

## API

| Function | Description |
|---|---|
| `move(items, event)` | Move an item from one position to another within a flat or grouped collection |
| `swap(items, event)` | Swap the positions of two items |
| `arrayMove(array, from, to)` | Move an item in an array from one index to another |
| `arraySwap(array, from, to)` | Swap two items in an array by index |

### Example

```ts
import {move} from '@dnd-kit/helpers';

function onDragEnd(event) {
  items = move(items, event);
}
```

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com) for full documentation.
