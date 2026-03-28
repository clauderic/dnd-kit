<script setup>
import { ref } from 'vue';
import { useDraggable } from '@dnd-kit/vue';

const element = ref(null);
useDraggable({ id: 'draggable', element });
</script>

<template>
  <button ref="element" class="draggable">Drag me</button>
</template>
