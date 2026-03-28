<script setup>
import { ref } from 'vue';
import { useDroppable } from '@dnd-kit/vue';

const element = ref(null);
const { isDropTarget } = useDroppable({ id: 'droppable', element });
</script>

<template>
  <div ref="element" :class="['droppable', { active: isDropTarget }]">
    <slot />
  </div>
</template>
