import type {Data} from '@dnd-kit/abstract';
import type {DroppableInput} from '@dnd-kit/dom';
import {Droppable} from '@dnd-kit/dom';
import {createEffect, createSignal} from 'solid-js';

import {useDeepSignal} from '../../hooks/useDeepSignal.ts';
import {useInstance} from '../hooks/useInstance.ts';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: Element;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const droppable = useInstance(
    (manager) =>
      new Droppable(
        {
          ...input,
          register: false,
          element: input.element,
        },
        manager
      )
  );
  const trackedDroppable = useDeepSignal(() => droppable);

  const [element, setElement] = createSignal<Element | undefined>(
    input.element
  );

  createEffect(() => {
    const el = element();
    if (el) droppable.element = el;

    droppable.id = input.id;
    droppable.accept = input.accept;
    droppable.type = input.type;
    droppable.disabled = input.disabled ?? false;

    if (input.collisionDetector) {
      droppable.collisionDetector = input.collisionDetector;
    }

    if (input.data) {
      droppable.data = input.data;
    }
  });

  return {
    get droppable() {
      return droppable;
    },
    get isDropTarget() {
      return trackedDroppable().isDropTarget;
    },
    ref: setElement,
  };
}
