import {injectDragDropContext} from '../context/context.ts';

export function useDragDropManager() {
  return injectDragDropContext();
}
