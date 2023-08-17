import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Sortable} from '@dnd-kit/dom';
import type {SortableInput} from '@dnd-kit/dom';

import {useDragDropManager} from '../context';
import {
  useComputed,
  useConstant,
  useOnValueChange,
  useImmediateEffect as immediateEffect,
} from '../hooks';
import {getCurrentValue, type RefOrValue} from '../utilities';

export interface UseSortableInput<T extends Data = Data>
  extends Omit<SortableInput<T>, 'activator' | 'element'> {
  activator?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
}

export function useSortable<T extends Data = Data>(input: UseSortableInput<T>) {
  const {accept, id, data, index, disabled, sensors, type} = input;
  const manager = useDragDropManager();
  const activator = getCurrentValue(input.activator);
  const element = getCurrentValue(input.element);
  const sortable = useConstant(
    () =>
      new Sortable(
        {
          ...input,
          activator,
          element,
        },
        manager
      )
  );

  const isDisabled = useComputed(() => sortable.disabled);
  const isDropTarget = useComputed(() => sortable.isDropTarget);
  const isDragSource = useComputed(() => sortable.isDragSource);

  useOnValueChange(accept, () => (sortable.accept = accept));
  useOnValueChange(type, () => (sortable.type = type));
  useOnValueChange(id, () => (sortable.id = id));
  useOnValueChange(data, () => (sortable.data = data ?? null));
  useOnValueChange(
    index,
    () => {
      if (manager.dragOperation.status.idle) {
        sortable.refreshShape();
      }
    },
    immediateEffect
  );
  useOnValueChange(index, () => (sortable.index = index));
  useOnValueChange(activator, () => (sortable.activator = activator));
  useOnValueChange(element, () => (sortable.element = element));
  useOnValueChange(disabled, () => (sortable.disabled = disabled === true));
  useOnValueChange(sensors, () => (sortable.sensors = sensors));

  useEffect(() => {
    // Cleanup on unmount
    return sortable.destroy;
  }, [sortable]);

  return {
    get isDisabled() {
      return isDisabled.value;
    },
    get isDragSource() {
      return isDragSource.value;
    },
    get isDropTarget() {
      return isDropTarget.value;
    },
    activatorRef: useCallback(
      (element: Element | null) => {
        sortable.activator = element ?? undefined;
      },
      [sortable]
    ),
    ref: useCallback(
      (element: Element | null) => {
        sortable.element = element ?? undefined;
      },
      [sortable]
    ),
    sourceRef: useCallback(
      (element: Element | null) => {
        sortable.source = element ?? undefined;
      },
      [sortable]
    ),
    targetRef: useCallback(
      (element: Element | null) => {
        sortable.target = element ?? undefined;
      },
      [sortable]
    ),
  };
}
