<script setup>
import { ref } from 'vue';
import { DragDropProvider } from '@dnd-kit/vue';
import { move } from '@dnd-kit/helpers';
import SortableItem from './SortableItem.vue';
import './styles.css';

const items = ref([1, 2, 3, 4]);

function onDragEnd(event) {
  items.value = move(items.value, event);
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <ul class="list">
      <SortableItem
        v-for="(id, index) in items"
        :key="id"
        :id="id"
        :index="index"
      />
    </ul>
  </DragDropProvider>
</template>
