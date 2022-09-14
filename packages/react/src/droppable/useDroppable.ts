import {useCallback, useEffect, useState} from 'react';
import {useComputed} from '@preact/signals-react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import type {DroppableInput} from '@dnd-kit/dom';

import {useDndContext} from '../context';

export function useDroppable<T extends Data = Data>(input: DroppableInput<T>) {
  const manager = useDndContext();
  const {registry} = manager;
  const [droppable] = useState(() => new Droppable(input, manager));
  const isOver = useComputed<boolean>(() => {
    const {dragOperation} = manager;
    return dragOperation.over?.includes(droppable) ?? false;
  });

  useEffect(() => {
    const unregister = registry.register(droppable);
    return unregister;
  }, [droppable, registry]);

  return {
    disabled: droppable.disabled,
    get isOver() {
      return isOver.value;
    },
    ref: useCallback(
      (element: Element | null) => {
        droppable.element = element ?? undefined;
      },
      [droppable]
    ),
  };
}
