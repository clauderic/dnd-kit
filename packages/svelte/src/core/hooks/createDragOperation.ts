import {useDeepSignal} from '../../hooks/useDeepSignal.svelte.js';
import {getDragDropManager} from './getDragDropManager.js';

export function createDragOperation() {
  const manager = getDragDropManager();
  const trackedDragOperation = useDeepSignal(() => manager.dragOperation);

  return {
    get source() {
      return trackedDragOperation.current.source;
    },
    get target() {
      return trackedDragOperation.current.target;
    },
    get status() {
      return trackedDragOperation.current.status;
    },
  };
}
