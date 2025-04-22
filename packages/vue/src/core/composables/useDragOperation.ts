import {computed} from 'vue';

import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();
  const source = computed(() => manager.value.dragOperation.source);
  const target = computed(() => manager.value.dragOperation.target);

  return {
    source,
    target,
  };
}
