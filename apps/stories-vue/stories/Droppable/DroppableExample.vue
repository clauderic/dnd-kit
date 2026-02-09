<script setup lang="ts">
import {ref} from 'vue';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/vue';
import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

const parent = ref<UniqueIdentifier | undefined>();

const draggableElement = ref<HTMLElement | null>(null);
const {isDragging} = useDraggable({id: 'draggable', element: draggableElement});

const droppableElement = ref<HTMLElement | null>(null);
const {isDropTarget} = useDroppable({id: 'droppable', element: droppableElement});

function onDragEnd(event: any) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id;
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <section>
      <div style="display: flex; justify-content: center">
        <button-component
          v-if="parent == null"
          ref="draggableElement"
          :data-shadow="isDragging"
        >
          <img :src="draggableIconSrc" alt="Draggable" :width="140" draggable="false" style="pointer-events: none" />
        </button-component>
      </div>
      <dropzone-component
        ref="droppableElement"
        :data-highlight="`${isDropTarget}`"
      >
        <button-component
          v-if="parent === 'droppable'"
          ref="draggableElement"
          :data-shadow="isDragging"
        >
          <img :src="draggableIconSrc" alt="Draggable" :width="140" draggable="false" style="pointer-events: none" />
        </button-component>
      </dropzone-component>
    </section>
  </DragDropProvider>
</template>
