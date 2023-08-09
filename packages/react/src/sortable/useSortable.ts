import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {CloneFeedback, Sortable} from '@dnd-kit/dom';
import type {SortableInput} from '@dnd-kit/dom';

import {useDragDropManager} from '../context';
import {
  useComputed,
  useConstant,
  useIsomorphicLayoutEffect,
  useOnValueChange,
} from '../hooks';
import {getCurrentValue, type RefOrValue} from '../utilities';

export interface UseSortableInput<T extends Data = Data>
  extends Omit<SortableInput<T>, 'activator' | 'element'> {
  activator?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
}

export function useSortable<T extends Data = Data>(input: UseSortableInput<T>) {
  const {id, index, disabled, feedback = CloneFeedback, sensors} = input;
  const activator = getCurrentValue(input.activator);
  const element = getCurrentValue(input.element);
  const manager = useDragDropManager();
  const sortable = useConstant(
    () => new Sortable({...input, activator, element, feedback: null}, manager)
  );

  const isDisabled = useComputed(() => sortable.disabled);
  const isDropTarget = useComputed(() => sortable.isDropTarget);
  const isDragSource = useComputed(() => sortable.isDragSource).value;

  useOnValueChange(id, () => (sortable.id = id));
  useOnValueChange(index, () => (sortable.index = index));
  useOnValueChange(activator, () => (sortable.activator = activator));
  useOnValueChange(element, () => (sortable.element = element));
  useOnValueChange(disabled, () => (sortable.disabled = disabled === true));
  useOnValueChange(sensors, () => (sortable.sensors = sensors));

  useIsomorphicLayoutEffect(() => {
    // Wait until React has had a chance to re-render before updating the feedback
    sortable.feedback = isDragSource ? feedback ?? null : null;
  }, [isDragSource]);

  useEffect(() => {
    // Cleanup on unmount
    return sortable.destroy;
  }, [sortable]);

  return {
    get isDisabled() {
      return isDisabled.value;
    },
    isDragSource,
    get isDropTarget() {
      return isDropTarget.value;
    },
    ref: useCallback(
      (element: Element | null) => {
        sortable.element = element ?? undefined;
      },
      [sortable]
    ),
  };
}
