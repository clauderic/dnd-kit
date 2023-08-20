import {useContext} from 'react';

import {DragDropContext} from './context.js';

export function useDragDropManager() {
  return useContext(DragDropContext);
}
