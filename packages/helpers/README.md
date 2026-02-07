# @dnd-kit/helpers

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/helpers.svg)](https://npm.im/@dnd-kit/helpers)

Helper utilities for the dnd-kit drag and drop toolkit. This package provides convenience functions for common array manipulation patterns that arise when handling drag and drop events, such as reordering and swapping items in lists or across groups.

## Installation

```
npm install @dnd-kit/helpers
```

## Key Exports

### High-level Event Handlers

- **`move(items, event)`** -- Reorders items based on a drag event. Works with flat arrays (`UniqueIdentifier[]` or `{ id: UniqueIdentifier }[]`) as well as grouped records (`Record<UniqueIdentifier, Items>`). For grouped records, it handles moving items between groups, including insertion into empty groups. Designed to be called directly from `onDragOver` or `onDragEnd` event handlers.

- **`swap(items, event)`** -- Same as `move`, but swaps the source and target items instead of shifting them. Supports both flat arrays and grouped records.

### Low-level Array Utilities

- **`arrayMove(array, fromIndex, toIndex)`** -- Returns a new array with the item at `fromIndex` moved to `toIndex`. All other items shift accordingly. Returns the original array if `fromIndex` equals `toIndex`.

- **`arraySwap(array, fromIndex, toIndex)`** -- Returns a new array with the items at `fromIndex` and `toIndex` swapped. Returns the original array if `fromIndex` equals `toIndex`.

## Usage

```ts
import { move, swap, arrayMove, arraySwap } from '@dnd-kit/helpers';

// In a drag event handler (React example):
function handleDragOver(event) {
  setItems((items) => move(items, event));
}

// Low-level array operations:
const arr = ['a', 'b', 'c', 'd'];

arrayMove(arr, 0, 2);  // ['b', 'c', 'a', 'd']
arraySwap(arr, 0, 2);  // ['c', 'b', 'a', 'd']
```

### Working with Grouped Items

The `move` and `swap` functions also support records where keys represent groups and values are arrays of items. Items can be moved between groups automatically:

```ts
import { move } from '@dnd-kit/helpers';

const items = {
  groupA: ['item-1', 'item-2'],
  groupB: ['item-3', 'item-4'],
};

// When a drag event moves item-1 to groupB,
// the function handles cross-group transfer automatically.
const updated = move(items, event);
```

## Dependencies

- `@dnd-kit/abstract` -- Provides the `Draggable`, `Droppable`, `DragDropManager`, and `DragDropEvents` types used to interpret drag events.

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com) to learn more about dnd-kit.
