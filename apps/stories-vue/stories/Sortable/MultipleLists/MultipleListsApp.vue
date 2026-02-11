<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider, PointerSensor, KeyboardSensor} from '@dnd-kit/vue';
import {defaultPreset} from '@dnd-kit/dom';
import {move} from '@dnd-kit/helpers';

import SortableColumn from './SortableColumn.vue';

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}

const ITEM_COUNT = 6;

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

const items = ref<Record<string, string[]>>({
  A: createRange(ITEM_COUNT).map((id) => `A${id}`),
  B: createRange(ITEM_COUNT).map((id) => `B${id}`),
  C: createRange(ITEM_COUNT).map((id) => `C${id}`),
  D: [],
});

const columns = Object.keys(items.value);
let snapshot = structuredClone(items.value);

function onDragStart() {
  snapshot = structuredClone(items.value);
}

function onDragOver(event: any) {
  const {source} = event.operation;
  if (source && source.type === 'column') return;
  items.value = move(items.value, event);
}

function onDragEnd(event: any) {
  if (event.canceled) {
    items.value = snapshot;
  }
}
</script>

<template>
  <DragDropProvider
    :plugins="defaultPreset.plugins"
    :sensors="sensors"
    @dragStart="onDragStart"
    @dragOver="onDragOver"
    @dragEnd="onDragEnd"
  >
    <div class="wrapper">
      <SortableColumn
        v-for="(column, columnIndex) in columns"
        :key="column"
        :id="column"
        :index="columnIndex"
        :rows="items[column]"
        :colors="COLORS"
      />
    </div>
  </DragDropProvider>
</template>
