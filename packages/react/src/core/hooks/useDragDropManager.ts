import {useContext} from 'react';

import {DragDropContext} from '../context/context.ts';

export function useDragDropManager() {
  return useContext(DragDropContext);
}
