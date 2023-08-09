import {useContext} from 'react';

import {DragDropContext} from './context';

export function useDragDropManager() {
  return useContext(DragDropContext);
}
