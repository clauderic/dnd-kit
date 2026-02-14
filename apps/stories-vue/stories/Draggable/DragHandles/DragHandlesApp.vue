<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider, useDraggable} from '@dnd-kit/vue';
</script>

<script lang="ts">
import {defineComponent} from 'vue';

const Draggable = defineComponent({
  setup() {
    const element = ref<HTMLElement | null>(null);
    const handle = ref<HTMLElement | null>(null);
    const {isDragging} = useDraggable({id: 'draggable', element, handle});
    return {element, handle, isDragging};
  },
  template: `
    <div class="btn" ref="element" :data-shadow="isDragging || undefined">
      draggable
      <button ref="handle" class="handle" />
    </div>
  `,
});

export default defineComponent({components: {Draggable}});
</script>

<template>
  <DragDropProvider>
    <Draggable />
  </DragDropProvider>
</template>
