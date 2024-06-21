import {useContext} from 'react';

import {DragDropContext} from './context.ts';
import {useComputed} from '../../hooks/useComputed.ts';

export function useDragDropManager() {
  return useContext(DragDropContext);
}

export function useDragOperation() {
  const manager = useDragDropManager();

  const source = useComputed(() => manager?.dragOperation.source);
  const target = useComputed(() => manager?.dragOperation.target);

  return {
    get source() {
      return source.value;
    },
    get target() {
      return target.value;
    },
  };
}
