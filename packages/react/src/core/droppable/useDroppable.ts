import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import {deepEqual} from '@dnd-kit/state';
import type {DroppableInput} from '@dnd-kit/dom';
import {useComputed, useOnValueChange} from '@dnd-kit/react/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/react/utilities';

import {useInstance} from '../hooks/useInstance.ts';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: RefOrValue<Element>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const {collisionDetector, data, disabled, id, accept, type} = input;
  const element = currentValue(input.element);
  const droppable = useInstance(
    (manager) =>
      new Droppable(
        {
          ...input,
          element,
        },
        manager
      )
  );
  const isDropTarget = useComputed(() => droppable.isDropTarget, [droppable]);

  useOnValueChange(id, () => (droppable.id = id));
  useOnValueChange(accept, () => (droppable.id = id), undefined, deepEqual);
  useOnValueChange(collisionDetector, () => (droppable.id = id));
  useOnValueChange(data, () => data && (droppable.data = data));
  useOnValueChange(disabled, () => (droppable.disabled = disabled === true));
  useOnValueChange(element, () => (droppable.element = element));
  useOnValueChange(type, () => (droppable.id = id));

  return {
    get isDropTarget() {
      return isDropTarget.value;
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
    droppable,
  };
}
