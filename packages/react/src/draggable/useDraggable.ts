import type {Data, Sensors} from '@dnd-kit/abstract';
import {Draggable} from '@dnd-kit/dom';
import type {DragDropManager, DraggableInput} from '@dnd-kit/dom';

import {useDndContext} from '../context';
import {useComputed, useConstant, useIsomorphicLayoutEffect} from '../hooks';
import {useConnectSensors} from '../sensors';
import {getCurrentValue, type RefOrValue} from '../utilities';
import {useEffect} from 'react';

export interface UseDraggableInput<T extends Data = Data>
  extends DraggableInput<T> {
  activator?: RefOrValue<Element>;
  element: RefOrValue<Element>;
  sensors?: Sensors<DragDropManager>;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const manager = useDndContext();
  const {disabled, sensors, id} = input;
  const draggable = useConstant(() => new Draggable(input));
  const activator = getCurrentValue(input.activator);
  const element = getCurrentValue(input.element);
  const isDragging = useComputed(() => {
    const {dragOperation} = manager;

    return dragOperation.source?.id === draggable.id;
  });

  useIsomorphicLayoutEffect(() => {
    draggable.activator = activator;
    draggable.element = element;
    draggable.disabled = Boolean(disabled);
  }, [activator, disabled, element, id]);

  useIsomorphicLayoutEffect(() => {
    const {registry} = manager;

    if (draggable.id !== id) {
      draggable.id = id;
    }

    const unregister = registry.register(draggable);

    return () => {
      unregister();
    };
  }, [manager, id]);

  useConnectSensors(sensors, manager, draggable);

  useEffect(() => {
    // Cleanup on unmount
    return draggable.destroy;
  }, [draggable]);

  return {
    get isDragging() {
      return isDragging.value;
    },
  };
}
