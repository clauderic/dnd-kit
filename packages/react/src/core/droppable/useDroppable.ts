import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import {deepEqual} from '@dnd-kit/state';
import type {DroppableInput} from '@dnd-kit/dom';
import {useComputed, useOnValueChange} from '@dnd-kit/react/hooks';
import {getCurrentValue, type RefOrValue} from '@dnd-kit/react/utilities';

import {useInstance} from '../hooks/useInstance.js';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: RefOrValue<Element>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const {collisionDetector, disabled, id, accept, type} = input;
  const element = getCurrentValue(input.element);
  const droppable = useInstance(
    (manager) => new Droppable({...input, element}, manager)
  );
  const isDisabled = useComputed(() => droppable.disabled);
  const isDropTarget = useComputed(() => droppable.isDropTarget);

  useOnValueChange(id, () => (droppable.id = id));
  useOnValueChange(accept, () => (droppable.id = id), undefined, deepEqual);
  useOnValueChange(collisionDetector, () => (droppable.id = id));
  useOnValueChange(disabled, () => (droppable.disabled = disabled === true));
  useOnValueChange(element, () => (droppable.element = element));
  useOnValueChange(type, () => (droppable.id = id));

  return {
    get isDisabled() {
      return isDisabled.value;
    },
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
