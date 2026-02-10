import {useDeepSignal} from '../../hooks/useDeepSignal.ts';
import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();
  const trackedDragOperation = useDeepSignal(
    () => manager?.dragOperation
  );

  return {
    source: () => trackedDragOperation()?.source,
    target: () => trackedDragOperation()?.target,
    status: () => trackedDragOperation()?.status,
  };
}
