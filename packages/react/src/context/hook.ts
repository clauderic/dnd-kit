import {useContext} from 'react';

import {DragDropContext} from './context';

export function useDndContext() {
  return useContext(DragDropContext);
}
