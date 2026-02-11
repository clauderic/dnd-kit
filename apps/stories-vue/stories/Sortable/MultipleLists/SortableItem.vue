<script setup lang="ts">
import {ref, computed} from 'vue';
import {useSortable} from '@dnd-kit/vue/sortable';

const props = defineProps<{
  id: string;
  column: string;
  index: number;
  accentColor: string;
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
  <li
    ref="element"
    class="item"
    :data-shadow="isDragging ? 'true' : undefined"
    :data-accent-color="column"
    :style="{'--accent-color': accentColor}"
  >
    {{ id }}
    <button ref="handle" class="handle" />
  </li>
</template>
