<script setup lang="ts">
import {ref, computed} from 'vue';
import {useSortable} from '@dnd-kit/vue/sortable';

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

const props = defineProps<{
  id: string;
  column: string;
  index: number;
}>();

const element = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);

const {isDragging} = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  group: computed(() => props.column),
  element,
  handle,
  accept: 'item',
  type: 'item',
  feedback: 'clone',
  data: computed(() => ({group: props.column})),
});
</script>

<template>
  <div
    ref="element"
    class="Item"
    :data-shadow="isDragging"
    :data-accent-color="column"
    :style="{'--accent-color': COLORS[column]}"
  >
    {{ id }}
    <handle-component ref="handle" />
  </div>
</template>
