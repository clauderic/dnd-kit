<script setup lang="ts">
import {ref} from 'vue';
import {DragDropProvider} from '@dnd-kit/vue';

const parent = ref<string | undefined>(undefined);
const droppables = ['A', 'B', 'C'];

function onDragEnd(event: any) {
  if (event.canceled) return;
  parent.value = event.operation.target?.id;
}
</script>

<script lang="ts">
import {defineComponent} from 'vue';
import {useDraggable, useDroppable} from '@dnd-kit/vue';

const DraggableItem = defineComponent({
  setup() {
    const element = ref<HTMLElement | null>(null);
    useDraggable({id: 'draggable', element});
    return {element};
  },
  template: `<button ref="element" class="btn">draggable</button>`,
});

const DroppableZone = defineComponent({
  props: {
    id: {type: String, required: true},
  },
  setup(props) {
    const element = ref<HTMLElement | null>(null);
    const {isDropTarget} = useDroppable({id: props.id, element});
    return {element, isDropTarget};
  },
  template: `<div ref="element" :class="['droppable', isDropTarget && 'active']"><slot /></div>`,
});

export default defineComponent({components: {DraggableItem, DroppableZone}});
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <div :style="{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '500px', margin: '0 auto'}">
      <div :style="{display: 'flex', alignItems: 'center', justifyContent: 'center'}">
        <DraggableItem v-if="parent == null" />
      </div>
      <DroppableZone v-for="id in droppables" :key="id" :id="id">
        <DraggableItem v-if="parent === id" />
      </DroppableZone>
    </div>
  </DragDropProvider>
</template>
