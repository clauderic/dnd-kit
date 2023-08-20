import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';
import {useComputed, useConstant, useOnValueChange} from '@dnd-kit/react/hooks';
import {getCurrentValue, type RefOrValue} from '@dnd-kit/react/utilities';

import {useDragDropManager} from '../context/index.js';

export interface UseDraggableInput<T extends Data = Data>
  extends Omit<DraggableInput<T>, 'activator' | 'element'> {
  activator?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const {disabled, id, sensors} = input;
  const manager = useDragDropManager();
  const activator = getCurrentValue(input.activator);
  const element = getCurrentValue(input.element);
  const draggable = useConstant(
    () => new Draggable({...input, activator, element}, manager)
  );
  const isDragSource = useComputed(() => draggable.isDragSource);

  useOnValueChange(id, () => (draggable.id = id));
  useOnValueChange(activator, () => (draggable.activator = activator));
  useOnValueChange(element, () => (draggable.element = element));
  useOnValueChange(disabled, () => (draggable.disabled = disabled === true));
  useOnValueChange(sensors, () => (draggable.sensors = sensors));

  useEffect(() => {
    // Cleanup on unmount
    return draggable.destroy;
  }, [draggable]);

  return {
    get isDragSource() {
      return isDragSource.value;
    },
    activatorRef: useCallback(
      (element: Element | null) => {
        draggable.activator = element ?? undefined;
      },
      [draggable]
    ),
    ref: useCallback(
      (element: Element | null) => {
        draggable.element = element ?? undefined;
      },
      [draggable]
    ),
  };
}
