<script setup lang="ts">
import {ref, computed} from 'vue';
import {DragDropProvider} from '@dnd-kit/vue';
import {useSortable} from '@dnd-kit/vue/sortable';
import {move} from '@dnd-kit/helpers';

const items = ref(Array.from({length: 20}, (_, i) => i + 1));

function onDragEnd(event: any) {
  items.value = move(items.value, event);
}
</script>

<script lang="ts">
import {defineComponent} from 'vue';

const SortableItem = defineComponent({
  props: {
    id: {type: Number, required: true},
    index: {type: Number, required: true},
  },
  setup(props) {
    const element = ref<HTMLElement | null>(null);
    const {isDragging} = useSortable({
      id: computed(() => props.id),
      index: computed(() => props.index),
      element,
    });
    return {element, isDragging};
  },
  template: `
    <div ref="element" class="item" :data-shadow="isDragging || undefined"
      :style="{height: '100%', justifyContent: 'center'}">
      {{ id }}
    </div>
  `,
});

export default defineComponent({components: {SortableItem}});
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <div :style="{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 150px)', gridAutoRows: '150px', gridAutoFlow: 'dense', gap: '18px', padding: '0 30px', maxWidth: '900px', marginInline: 'auto', justifyContent: 'center'}">
      <SortableItem
        v-for="(id, index) in items"
        :key="id"
        :id="id"
        :index="index"
      />
    </div>
  </DragDropProvider>
</template>
