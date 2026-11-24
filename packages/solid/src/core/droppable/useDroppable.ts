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

  createEffect(
    () => ({
      el: element(),
      id: input.id,
      accept: input.accept,
      type: input.type,
      disabled: input.disabled,
      collisionDetector: input.collisionDetector,
      data: input.data,
    }),
    ({el, id, accept, type, disabled, collisionDetector, data}) => {
      if (el) droppable.element = el;

      droppable.id = id;
      droppable.accept = accept;
      droppable.type = type;
      droppable.disabled = disabled ?? false;

      if (collisionDetector) {
        droppable.collisionDetector = collisionDetector;
      }

      if (data) {
        droppable.data = data;
      }
    }
  );

  return {
    get droppable() {
      return droppable;
    },
    isDropTarget: () => trackedDroppable().isDropTarget,
    ref: setElement,
  };
}
