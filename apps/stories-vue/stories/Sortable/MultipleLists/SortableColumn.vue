<script setup lang="ts">
import {ref, computed} from 'vue';
import {CollisionPriority} from '@dnd-kit/abstract';
import {useSortable} from '@dnd-kit/vue/sortable';

import SortableItem from './SortableItem.vue';

const props = defineProps<{
  id: string;
  index: number;
  rows: string[];
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
  <container-component ref="element" :data-shadow="isDragging ? 'true' : undefined">
    <div class="Header">
      {{ id }}
      <handle-component ref="handle" />
    </div>
    <ul style="list-style: none; padding: 15px; margin: 0; display: grid; gap: 16px">
      <SortableItem
        v-for="(itemId, itemIndex) in rows"
        :key="itemId"
        :id="itemId"
        :column="id"
        :index="itemIndex"
      />
    </ul>
  </container-component>
</template>
