import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import type {DroppableInput} from '@dnd-kit/dom';

import {useDragDropManager} from '../context';
import {useComputed, useConstant, useOnValueChange} from '../hooks';
import {getCurrentValue, type RefOrValue} from '../utilities';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: RefOrValue<Element>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const manager = useDragDropManager();
  const {disabled, id} = input;
  const element = getCurrentValue(input.element);
  const droppable = useConstant(
    () => new Droppable({...input, element}, manager)
  );
  const isDisabled = useComputed(() => droppable.disabled);
  const isDropTarget = useComputed(() => droppable.isDropTarget);

  useOnValueChange(id, () => (droppable.id = id));
  useOnValueChange(element, () => (droppable.element = element));
  useOnValueChange(disabled, () => (droppable.disabled = disabled === true));

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
