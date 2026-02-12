<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/vue';
</script>

<script lang="ts">
import {defineComponent} from 'vue';

const Draggable = defineComponent({
  setup() {
    const element = ref<HTMLElement | null>(null);
    const {isDragging} = useDraggable({id: 'draggable', element});
    return {element, isDragging};
  },
  template: `
    <button class="btn" ref="element" :disabled="isDragging || undefined">
      draggable
    </button>
  `,
});

export default defineComponent({components: {Draggable, DragOverlay}});
</script>

<template>
  <DragDropProvider>
    <div>
      <Draggable />
      <DragOverlay>
        <button class="btn" data-shadow="true">
          overlay
        </button>
      </DragOverlay>
    </div>
  </DragDropProvider>
</template>
