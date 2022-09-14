import {useCallback, useEffect, useState} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';

import {useDndContext} from '../context';

export function useDraggable<T extends Data = Data>(input: DraggableInput<T>) {
  const manager = useDndContext();
  const {registry} = manager;
  const [draggable] = useState(() => new Draggable(input, manager));

  useEffect(() => {
    const unregister = registry.register(draggable);
    return unregister;
  }, [draggable, registry]);

  return {
    disabled: draggable.disabled,
    ref: useCallback(
      (element: Element | null) => {
        draggable.element = element ?? undefined;
      },
      [draggable]
    ),
    activatorRef: useCallback(
      (element: Element | null) => {
        draggable.activator = element ?? undefined;
      },
      [draggable]
    ),
  };
}
