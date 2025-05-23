import type {Data} from '@dnd-kit/abstract';
import type {Draggable, Droppable, DragDropManager} from '@dnd-kit/dom';
import {useComputed} from '@dnd-kit/react/hooks';

import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>() {
  const manager = useDragDropManager<T, U, V, W>();
  const source = useComputed(() => manager?.dragOperation.source, [manager]);
  const target = useComputed(() => manager?.dragOperation.target, [manager]);

  return {
    get source() {
      return source.value;
    },
    get target() {
      return target.value;
    },
  };
}
