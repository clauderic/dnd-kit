import type {Data, SensorDescriptor} from '@dnd-kit/abstract';
import {Draggable, PointerSensor} from '@dnd-kit/dom';
import type {DraggableInput, DOMSensor, DragDropManager} from '@dnd-kit/dom';

import {useDndContext} from '../context';
import {useComputed, useConstant, useIsomorphicLayoutEffect} from '../hooks';
import {getCurrentValue, type RefOrValue} from '../utilities';

export interface UseDraggableInput<T extends Data = Data>
  extends DraggableInput<T> {
  activator?: RefOrValue<Element>;
  element: RefOrValue<Element>;
  sensors?: SensorDescriptor<any, any>[];
}

// const sensors: SensorDescriptor<DragDropManager, any>[] = [
//   {sensor: PointerSensor},
// ];

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const manager = useDndContext();
  const {disabled, sensors} = input;
  const {registry} = manager;
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
  }, [activator, element]);

  useIsomorphicLayoutEffect(() => {
    const unregister = registry.register(draggable);

    return () => {
      unregister();
      draggable.destroy();
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    draggable.disabled = Boolean(disabled);
  }, [disabled]);

  // useIsomorphicLayoutEffect(() => {
  //   const sensors = input.sensors ?? DEFAULT_SENSORS;
  //   const unbindFunctions = sensors.map((sensor) =>
  //     sensor.bind(draggable, manager)
  //   );

  //   return function cleanup() {
  //     unbindFunctions.forEach((unbind) => unbind());
  //   };
  // }, [draggable, manager, input.sensors]);

  return {
    get isDragging() {
      return isDragging.value;
    },
  };
}
