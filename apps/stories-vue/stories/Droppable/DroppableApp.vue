<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/vue';

const parent = ref<string | undefined>(undefined);

function onDragEnd(event: any) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id;
}
</script>

<script lang="ts">
import {defineComponent} from 'vue';

const DraggableItem = defineComponent({
  setup() {
    const element = ref<HTMLElement | null>(null);
    useDraggable({id: 'draggable', element});
    return {element};
  },
  template: `<button ref="element" class="btn">draggable</button>`,
});

const DroppableZone = defineComponent({
  setup() {
    const element = ref<HTMLElement | null>(null);
    const {isDropTarget} = useDroppable({id: 'droppable', element});
    return {element, isDropTarget};
  },
  template: `<div ref="element" :class="['droppable', isDropTarget && 'active']"><slot /></div>`,
});

export default defineComponent({components: {DraggableItem, DroppableZone}});
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <section class="drop-layout">
      <DraggableItem v-if="parent == null" />
      <DroppableZone>
        <DraggableItem v-if="parent === 'droppable'" />
      </DroppableZone>
    </section>
  </DragDropProvider>
</template>
