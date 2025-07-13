import { useContext } from 'solid-js';
import { DragDropContext } from '../context/index.ts';

import type {Data} from '@dnd-kit/abstract';
import type {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

export function useDragDropManager<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>() {
    return useContext(DragDropContext) as W | null;
}
