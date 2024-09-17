import {useComputed} from '@dnd-kit/react/hooks';

import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();
  const source = useComputed(() => manager?.dragOperation.source, [manager]);
  const target = useComputed(() => manager?.dragOperation.target, [manager]);

  return {
    get source() {
      return source.value;
    },
    get target() {
      return target.value;
    },
  };
}
