import type {PointerEvent} from 'react';
import {getOwnerDocument} from '@dnd-kit/utilities';

import type {SensorProps} from '../types';
import {
  AbstractPointerSensor,
  AbstractPointerSensorOptions,
  PointerEventHandlers,
} from './AbstractPointerSensor';
import type {AnyData} from '../../store/types';

const events: PointerEventHandlers = {
  move: {name: 'pointermove'},
  end: {name: 'pointerup'},
};

export interface PointerSensorOptions<DraggableData, DroppableData>
  extends AbstractPointerSensorOptions<DraggableData, DroppableData> {}

export type PointerSensorProps<DraggableData, DroppableData> = SensorProps<
  PointerSensorOptions<DraggableData, DroppableData>,
  DraggableData,
  DroppableData
>;

export class PointerSensor<
  DraggableData,
  DroppableData
> extends AbstractPointerSensor<DraggableData, DroppableData> {
  constructor(props: PointerSensorProps<DraggableData, DroppableData>) {
    const {event} = props;
    // Pointer events stop firing if the target is unmounted while dragging
    // Therefore we attach listeners to the owner document instead
    const listenerTarget = getOwnerDocument(event.target);

    super(props, events, listenerTarget);
  }

  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: (
        {nativeEvent: event}: PointerEvent,
        {onActivation}: PointerSensorOptions<AnyData, AnyData>
      ) => {
        if (!event.isPrimary || event.button !== 0) {
          return false;
        }

        onActivation?.({event});

        return true;
      },
    },
  ];
}
