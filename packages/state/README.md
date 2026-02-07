# @dnd-kit/state

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/state.svg)](https://npm.im/@dnd-kit/state)

Reactive state management library for the dnd-kit drag and drop toolkit. Built on top of `@preact/signals-core`, this package provides signals, computed values, decorators, effects, and history tracking used internally by other dnd-kit packages. It can also be used directly when building custom plugins or extensions.

## Installation

```
npm install @dnd-kit/state
```

## Key Exports

### Re-exports from `@preact/signals-core`

- **`signal`** / **`Signal`** -- Create and work with reactive signals.
- **`ReadonlySignal`** -- Type for read-only computed signals.
- **`batch`** -- Batch multiple signal updates into a single notification.
- **`effect`** -- Create a reactive side effect that re-runs when its dependencies change.
- **`untracked`** -- Read signal values without subscribing to them.

### Computed

- **`computed(fn, comparator?)`** -- Creates a computed signal. Optionally accepts a custom comparator function to prevent unnecessary updates when the computed value is structurally equivalent to the previous one.

### Decorators

- **`@reactive`** -- A class accessor decorator that turns a class field into a reactive signal-backed property. Reads and writes to the property automatically subscribe to and update the underlying signal.
- **`@derived`** -- A class getter decorator that memoizes the getter as a computed signal. The getter is only re-evaluated when its reactive dependencies change.
- **`@enumerable(boolean?)`** -- A decorator that controls whether a class member is enumerable. Useful for controlling serialization behavior.

### Effects

- **`effects(...fns)`** -- Registers multiple reactive effects at once and returns a single cleanup function that tears down all of them.

### Comparators

- **`deepEqual(a, b)`** -- A recursive deep equality comparator that supports primitives, arrays, objects, and `Set` instances. Useful as a custom comparator for `computed()`.

### Snapshot

- **`snapshot(value)`** -- Creates a shallow, non-reactive copy of an object by reading its properties inside `untracked()`. Useful for capturing the current state of a reactive object without creating a subscription.

### History

- **`ValueHistory<T>`** -- A class that tracks the `current`, `initial`, and `previous` values of a reactive property. Supports a custom equality function and provides a `reset()` method. All values are backed by reactive signals.
- **`WithHistory<T>`** -- A type describing the shape of an object with `current`, `initial`, and `previous` properties.

### Store

- **`WeakStore<WeakKey, Key, Value>`** -- A two-level store backed by a `WeakMap` and inner `Map`. Provides `get()`, `set()`, and `clear()` methods. Useful for associating data with object instances without preventing garbage collection.

### Types

- **`CleanupFunction`** -- A `() => void` function returned by effects for teardown.
- **`Effect`** -- The function signature accepted by `effect()`.

## Usage

```ts
import { signal, effect, batch } from '@dnd-kit/state';

const count = signal(0);

// This effect runs whenever `count` changes
const cleanup = effect(() => {
  console.log('Count is:', count.value);
});

batch(() => {
  count.value = 1;
  count.value = 2;
});
// Logs "Count is: 2" (batched, so only one notification)

cleanup();
```

```ts
import { reactive, derived } from '@dnd-kit/state';

class Counter {
  @reactive accessor value = 0;

  @derived get doubled() {
    return this.value * 2;
  }
}
```

## Dependencies

This package depends on `@preact/signals-core` for its reactive primitives.

## Documentation

Visit [docs.dndkit.com](https://docs.dndkit.com) to learn more about dnd-kit.
