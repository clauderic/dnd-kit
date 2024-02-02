import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import {deepEqual} from '@dnd-kit/state';
import type {DroppableInput} from '@dnd-kit/dom';
import {useComputed, useConstant, useOnValueChange} from '@dnd-kit/react/hooks';
import {getCurrentValue, type RefOrValue} from '@dnd-kit/react/utilities';

import {useDragDropManager} from '../context/index.js';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: RefOrValue<Element>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const manager = useDragDropManager();
  const {collisionDetector, disabled, id, accept, type} = input;
  const element = getCurrentValue(input.element);
  const droppable = useConstant(
    () => new Droppable({...input, element}, manager),
    manager
  );
  const isDisabled = useComputed(() => droppable.disabled);
  const isDropTarget = useComputed(() => droppable.isDropTarget);

  useOnValueChange(id, () => (droppable.id = id));
  useOnValueChange(accept, () => (droppable.id = id), undefined, deepEqual);
  useOnValueChange(collisionDetector, () => (droppable.id = id));
  useOnValueChange(disabled, () => (droppable.disabled = disabled === true));
  useOnValueChange(element, () => (droppable.element = element));
  useOnValueChange(type, () => (droppable.id = id));

  useEffect(() => {
    // Cleanup on unmount
    return droppable.destroy;
  }, [droppable]);

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
