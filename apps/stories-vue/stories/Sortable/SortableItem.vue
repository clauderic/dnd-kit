<script setup lang="ts">
import {ref, computed} from 'vue';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {useSortable} from '@dnd-kit/vue/sortable';

const props = defineProps<{
  id: UniqueIdentifier;
  index: number;
  layout?: 'vertical' | 'horizontal' | 'grid';
}>();

const element = ref<HTMLElement | null>(null);
const {isDragging} = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  element,
});

const style = computed(() => {
  const s: Record<string, string> = {};
  if (props.layout === 'horizontal') {
    s.minWidth = '100px';
    s.justifyContent = 'center';
  }
  if (props.layout === 'grid') {
    s.height = '100%';
    s.justifyContent = 'center';
  }
  return s;
});
</script>

<template>
  <div
    ref="element"
    class="Item"
    :data-shadow="isDragging"
    :style="style"
  >
    {{ id }}
  </div>
</template>
