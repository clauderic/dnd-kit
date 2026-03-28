<script setup>
import { ref, computed } from 'vue';
import { useSortable } from '@dnd-kit/vue/sortable';

const props = defineProps(['id', 'index']);
const element = ref(null);
const { isDragging } = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  element,
});
</script>

<template>
  <li ref="element" class="item">
    Item {{ id }}
  </li>
</template>
