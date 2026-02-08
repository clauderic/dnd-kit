import {useContext} from 'solid-js';

import {DragDropContext} from '../context/context.ts';

export function useDragDropManager() {
  return useContext(DragDropContext);
}
