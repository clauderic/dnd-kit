import {useContext} from 'react';

import {DragDropContext} from './context.js';
import {useComputed} from '../../hooks/useComputed.js';

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
