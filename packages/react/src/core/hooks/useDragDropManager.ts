import {useContext} from 'react';
import type {Data} from '@dnd-kit/abstract';
import type {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';

import {DragDropContext} from '../context/context.ts';

export function useDragDropManager<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>(): W | null {
  return useContext(DragDropContext) as W | null;
}
