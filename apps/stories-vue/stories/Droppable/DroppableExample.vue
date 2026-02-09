<script setup lang="ts">
import {ref} from 'vue';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/vue';
import DraggableItem from './DraggableItem.vue';
import DroppableZone from './DroppableZone.vue';

const parent = ref<UniqueIdentifier | undefined>();

function onDragEnd(event: any) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id;
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <section>
      <div style="display: flex; justify-content: center">
        <DraggableItem v-if="parent == null" />
      </div>
      <DroppableZone>
        <DraggableItem v-if="parent === 'droppable'" />
      </DroppableZone>
    </section>
  </DragDropProvider>
</template>
