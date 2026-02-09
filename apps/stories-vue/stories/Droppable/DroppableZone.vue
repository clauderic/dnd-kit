<script setup lang="ts">
import {ref} from 'vue';
import {useDroppable} from '@dnd-kit/vue';

const element = ref<HTMLElement | null>(null);
const {isDropTarget} = useDroppable({id: 'droppable', element});
</script>

<template>
  <dropzone-component ref="element" :data-highlight="`${isDropTarget}`">
    <slot />
  </dropzone-component>
</template>
