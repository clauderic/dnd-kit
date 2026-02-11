<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider, useDraggable} from '@dnd-kit/vue';
</script>

<script lang="ts">
import {defineComponent} from 'vue';

const Draggable = defineComponent({
  setup() {
    const element = ref<HTMLElement | null>(null);
    useDraggable({id: 'draggable', element});
    return {element};
  },
  template: `<button ref="element" class="btn">draggable</button>`,
});

export default defineComponent({components: {Draggable}});
</script>

<template>
  <DragDropProvider>
    <Draggable />
  </DragDropProvider>
</template>
