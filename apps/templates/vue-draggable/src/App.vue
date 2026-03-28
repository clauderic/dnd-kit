<script setup>
import { ref } from 'vue';
import { DragDropProvider } from '@dnd-kit/vue';
import Draggable from './Draggable.vue';
import Droppable from './Droppable.vue';

const parent = ref(undefined);

function onDragEnd(event) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id;
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <div class="container">
      <Draggable v-if="parent == null" />
      <Droppable>
        <Draggable v-if="parent === 'droppable'" />
      </Droppable>
    </div>
  </DragDropProvider>
</template>
