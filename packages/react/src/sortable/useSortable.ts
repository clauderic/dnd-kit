import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import type {UniqueIdentifier} from '@dnd-kit/types';
import type {DraggableInput, DroppableInput} from '@dnd-kit/dom';

import {useDraggable} from '../draggable';
import {useDroppable} from '../droppable';

interface SortableInput<T extends Data = Data> {
  id: UniqueIdentifier;
  type?: string;
}

export function useSortable<T extends Data = Data>(input: SortableInput<T>) {
  const draggable = useDraggable(input);
  const droppable = useDroppable(input);

  return {
    ...droppable,
    ref: useCallback(
      (element: Element | null) => {
        droppable.element = element ?? undefined;
      },
      [droppable]
    ),
  };
}
