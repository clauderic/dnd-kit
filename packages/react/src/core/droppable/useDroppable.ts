import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import {deepEqual} from '@dnd-kit/state';
import type {DroppableInput} from '@dnd-kit/dom';
import {
  useComputed,
  useOnValueChange,
  useOnElementChange,
  useDeepSignal,
} from '@dnd-kit/react/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/react/utilities';

import {useInstance} from '../hooks/useInstance.ts';
import {defaultCollisionDetection} from '@dnd-kit/collision';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: RefOrValue<Element>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const {collisionDetector, data, disabled, element, id, accept, type} = input;
  const droppable = useInstance(
    (manager) =>
      new Droppable(
        {
          ...input,
          register: false,
          element: currentValue(element),
        },
        manager
      )
  );
  const trackedDroppalbe = useDeepSignal(droppable);

  useOnValueChange(id, () => (droppable.id = id));
  useOnElementChange(element, (element) => (droppable.element = element));
  useOnValueChange(
    accept,
    () => (droppable.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(
    collisionDetector,
    () =>
      (droppable.collisionDetector =
        collisionDetector ?? defaultCollisionDetection)
  );
  useOnValueChange(data, () => data && (droppable.data = data));
  useOnValueChange(disabled, () => (droppable.disabled = disabled === true));
  useOnValueChange(type, () => (droppable.type = type));

  return {
    droppable: trackedDroppalbe,
    get isDropTarget() {
      return trackedDroppalbe.isDropTarget;
    },
    ref: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          droppable.element?.isConnected &&
          !droppable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        droppable.element = element ?? undefined;
      },
      [droppable]
    ),
  };
}
