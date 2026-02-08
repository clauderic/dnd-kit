import {useDeepSignal} from '../../hooks/useDeepSignal.ts';
import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();
  const trackedDragOperation = useDeepSignal(
    () => manager?.dragOperation
  );

  return {
    get source() {
      return trackedDragOperation()?.source;
    },
    get target() {
      return trackedDragOperation()?.target;
    },
    get status() {
      return trackedDragOperation()?.status;
    },
  };
}
