<script setup lang="ts">
import {ref, computed} from 'vue';
import {DragDropProvider} from '@dnd-kit/vue';
import {move} from '@dnd-kit/helpers';
import {createRange} from '@dnd-kit/stories-shared/utilities';
import SortableItem from './SortableItem.vue';

const props = withDefaults(
  defineProps<{
    layout?: 'vertical' | 'horizontal' | 'grid';
    itemCount?: number;
  }>(),
  {
    layout: 'vertical',
    itemCount: 15,
  }
);

const items = ref(createRange(props.itemCount));

const wrapperStyle = computed(() => {
  const base = {gap: '18px', padding: '0 30px'};

  switch (props.layout) {
    case 'grid':
      return {
        ...base,
        display: 'grid',
        maxWidth: '900px',
        marginInline: 'auto',
        gridTemplateColumns: 'repeat(auto-fill, 150px)',
        gridAutoFlow: 'dense',
        gridAutoRows: '150px',
        justifyContent: 'center',
      };
    case 'horizontal':
      return {
        ...base,
        display: 'inline-flex',
        flexDirection: 'row' as const,
        alignItems: 'stretch',
        height: '180px',
      };
    case 'vertical':
    default:
      return {
        ...base,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
      };
  }
});

function onDragEnd(event: any) {
  items.value = move(items.value, event);
}
</script>

<template>
  <DragDropProvider @dragEnd="onDragEnd">
    <div :style="wrapperStyle">
      <SortableItem
        v-for="(id, index) in items"
        :key="id"
        :id="id"
        :index="index"
        :layout="props.layout"
      />
    </div>
  </DragDropProvider>
</template>
