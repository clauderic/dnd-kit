# @dnd-kit/vue

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/vue.svg)](https://npm.im/@dnd-kit/vue)

The Vue adapter for **@dnd-kit** — a lightweight, performant, and extensible drag and drop toolkit. Built on top of `@dnd-kit/dom`.

## Installation

```bash
npm install @dnd-kit/vue
```

## Quick start

```vue
<script setup>
import {ref} from 'vue';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/vue';

const draggable = useDraggable({id: 'draggable'});
const droppable = useDroppable({id: 'droppable'});
const parent = ref(null);

function onDragEnd(event) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id ?? null;
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <button v-if="!parent" :ref="draggable.ref">Drag me</button>
    <div :ref="droppable.ref">
      <button v-if="parent" :ref="draggable.ref">Dropped!</button>
    </div>
  </DragDropProvider>
</template>
```

## Composables

| Composable | Import | Description |
|---|---|---|
| `useDraggable` | `@dnd-kit/vue` | Make an element draggable |
| `useDroppable` | `@dnd-kit/vue` | Create a drop target |
| `useSortable` | `@dnd-kit/vue/sortable` | Combine drag and drop with sorting |

## Components

- **`<DragDropProvider>`** — Wraps your drag and drop interface, manages sensors, plugins, and events.
- **`<DragOverlay>`** — Renders a custom overlay element during drag operations.

## Documentation

Visit [next.dndkit.com](https://next.dndkit.com/vue) for full documentation, guides, and interactive examples.
