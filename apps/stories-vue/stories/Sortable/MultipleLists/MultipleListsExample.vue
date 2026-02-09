<script setup lang="ts">
import {ref} from 'vue';
import {PointerSensor, KeyboardSensor, DragDropProvider} from '@dnd-kit/vue';
import {move} from '@dnd-kit/helpers';
import {createRange, cloneDeep} from '@dnd-kit/stories-shared/utilities';

import SortableColumn from './SortableColumn.vue';

const props = withDefaults(
  defineProps<{
    itemCount?: number;
  }>(),
  {itemCount: 5}
);

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

const items = ref<Record<string, string[]>>({
  A: createRange(props.itemCount).map((id) => `A${id}`),
  B: createRange(props.itemCount).map((id) => `B${id}`),
  C: createRange(props.itemCount).map((id) => `C${id}`),
  D: [],
});

const columns = Object.keys(items.value);
let snapshot = cloneDeep(items.value);

function onDragStart() {
  snapshot = cloneDeep(items.value);
}

function onDragOver(event: any) {
  const {source} = event.operation;

  if (source?.type === 'column') {
    return;
  }

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
    :sensors="sensors"
    @dragStart="onDragStart"
    @dragOver="onDragOver"
    @dragEnd="onDragEnd"
  >
    <div style="display: flex; flex-direction: row; gap: 20px">
      <SortableColumn
        v-for="(column, columnIndex) in columns"
        :key="column"
        :id="column"
        :index="columnIndex"
        :rows="items[column]"
      />
    </div>
  </DragDropProvider>
</template>
