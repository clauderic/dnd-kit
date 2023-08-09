import {useCallback, useEffect} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {CloneFeedback, Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';

import {useDragDropManager} from '../context';
import {
  useComputed,
  useConstant,
  useIsomorphicLayoutEffect,
  useOnValueChange,
} from '../hooks';
import {getCurrentValue, type RefOrValue} from '../utilities';

export interface UseDraggableInput<T extends Data = Data>
  extends Omit<DraggableInput<T>, 'activator' | 'element'> {
  activator?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const manager = useDragDropManager();
  const {disabled, id, sensors, feedback = CloneFeedback} = input;
  const activator = getCurrentValue(input.activator);
  const element = getCurrentValue(input.element);
  const draggable = useConstant(
    () => new Draggable({...input, activator, element, feedback: null}, manager)
  );
  const isDragSource = useComputed(() => draggable.isDragSource).value;

  useOnValueChange(id, () => (draggable.id = id));
  useOnValueChange(activator, () => (draggable.activator = activator));
  useOnValueChange(element, () => (draggable.element = element));
  useOnValueChange(disabled, () => (draggable.disabled = disabled === true));
  useOnValueChange(sensors, () => (draggable.sensors = sensors));

  useIsomorphicLayoutEffect(() => {
    // Wait until React has had a chance to re-render before updating the feedback
    draggable.feedback = isDragSource ? feedback ?? null : null;
  }, [isDragSource]);

  useEffect(() => {
    // Cleanup on unmount
    return draggable.destroy;
  }, [draggable]);

  return {
    isDragSource,
    ref: useCallback(
      (element: Element | null) => {
        draggable.element = element ?? undefined;
      },
      [draggable]
    ),
  };
}
