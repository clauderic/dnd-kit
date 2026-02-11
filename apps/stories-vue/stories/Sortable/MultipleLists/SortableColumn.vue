<script setup lang="ts">
import {ref, computed} from 'vue';
import {CollisionPriority} from '@dnd-kit/abstract';
import {useSortable} from '@dnd-kit/vue/sortable';

import SortableItem from './SortableItem.vue';

const props = defineProps<{
  id: string;
  index: number;
  rows: string[];
  colors: Record<string, string>;
}>();

const element = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);

const {isDragging} = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  element,
  handle,
  accept: ['column', 'item'],
  collisionPriority: CollisionPriority.Low,
  type: 'column',
});
</script>

<template>
  <div
    ref="element"
    class="container"
    :data-shadow="isDragging ? 'true' : undefined"
  >
    <div class="container-header">
      {{ id }}
      <button ref="handle" class="handle" />
    </div>
    <ul>
      <SortableItem
        v-for="(itemId, itemIndex) in rows"
        :key="itemId"
        :id="itemId"
        :column="id"
        :index="itemIndex"
        :accent-color="colors[id]"
      />
    </ul>
  </div>
</template>
