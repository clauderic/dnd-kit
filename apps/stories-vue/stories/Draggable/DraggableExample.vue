<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider, useDraggable} from '@dnd-kit/vue';
import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

const element = ref<HTMLElement | null>(null);
const {isDragging} = useDraggable({id: 'draggable', element});
</script>

<template>
  <DragDropProvider>
    <div>
      <button-component ref="element" :data-shadow="isDragging">
        <img :src="draggableIconSrc" alt="Draggable" :width="140" draggable="false" style="pointer-events: none" />
      </button-component>
    </div>
  </DragDropProvider>
</template>
