import { useContext } from 'solid-js';

import { DragDropContext } from '../context/index.ts';

export function useDragDropManager() {
    return useContext(DragDropContext);
}
