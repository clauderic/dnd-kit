import {computed} from 'vue';

import {useDeepSignal} from '../../composables/useDeepSignal.ts';
import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();
  const trackedDragOperation = useDeepSignal(
    computed(() => manager.value.dragOperation)
  );

  return {
    get source() {
      return trackedDragOperation.value.source;
    },
    get target() {
      return trackedDragOperation.value.target;
    },
    get status() {
      return trackedDragOperation.value.status;
    },
  };
}
