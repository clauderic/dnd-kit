import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import type {DroppableInput} from '@dnd-kit/dom';

import {useDndContext} from '../context';
import {useComputed, useConstant} from '../hooks';

export function useDroppable<T extends Data = Data>(input: DroppableInput<T>) {
  const manager = useDndContext();
  const {disabled} = input;
  const {registry} = manager;
  const droppable = useConstant(() => new Droppable(input));
  const isDropTarget = useComputed(() => {
    const {dragOperation} = manager;

    return dragOperation.target === droppable;
  });

  useEffect(() => {
    droppable.disabled = disabled === true;
  }, [disabled]);

  useEffect(() => {
    const unregister = registry.register(droppable);

    return () => {
      unregister();
      droppable.destroy();
    };
  }, [droppable]);

  return {
    disabled: droppable.disabled,
    get isDropTarget() {
      return isDropTarget.value;
    },
    ref: useCallback(
      (element: Element | null) => {
        droppable.element = element ?? undefined;
      },
      [droppable]
    ),
  };
}
