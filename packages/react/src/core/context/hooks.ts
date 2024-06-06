import {useContext} from 'react';

import {DragDropContext} from './context.ts';
import {useComputed} from '../../hooks/useComputed.ts';

export function useDragDropManager() {
  return useContext(DragDropContext);
}

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
