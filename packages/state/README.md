# @dnd-kit/state

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/state.svg)](https://npm.im/@dnd-kit/state)

Internal reactive state management library for **@dnd-kit**, built on [Preact Signals](https://preactjs.com/guide/v10/signals/).

> **Note:** This is an internal package used by `@dnd-kit/abstract` and the framework adapters. You generally don't need to install or use it directly.

## Overview

Provides fine-grained reactivity primitives that power the core drag and drop state:

- **Signals** — `signal`, `computed`, `ReadonlySignal`
- **Effects** — `effect`, `effects`, `batch`, `untracked`
- **Decorators** — `reactive`, `derived`, `enumerable` for class-based reactive properties
- **Utilities** — `deepEqual`, `snapshot`, `WeakStore`, `ValueHistory`
