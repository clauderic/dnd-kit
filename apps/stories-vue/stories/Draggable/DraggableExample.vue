<script setup lang="ts">
import {DragDropProvider} from '@dnd-kit/vue';
import DraggableItem from './DraggableItem.vue';
</script>

<template>
  <DragDropProvider>
    <div>
      <DraggableItem />
    </div>
  </DragDropProvider>
</template>
