import {useComputed} from '@dnd-kit/react/hooks';

import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();
  const {dragOperation} = manager;

  const source = useComputed(() => dragOperation.source);
  const target = useComputed(() => dragOperation.target);

  return {
    get source() {
      return source.value;
    },
    get target() {
      return target.value;
    },
  };
}
