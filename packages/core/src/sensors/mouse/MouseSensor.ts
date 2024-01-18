import type {MouseEvent} from 'react';
import {getOwnerDocument} from '@dnd-kit/utilities';

import type {SensorProps} from '../types';
import {
  AbstractPointerSensor,
  PointerEventHandlers,
  AbstractPointerSensorOptions,
} from '../pointer';
import type {AnyData} from '../../store';

const events: PointerEventHandlers = {
  move: {name: 'mousemove'},
  end: {name: 'mouseup'},
};

enum MouseButton {
  RightClick = 2,
}

export interface MouseSensorOptions<DraggableData, DroppableData> extends AbstractPointerSensorOptions<DraggableData, DroppableData> {}

export type MouseSensorProps<DraggableData, DroppableData> = SensorProps<
  MouseSensorOptions<DraggableData, DroppableData>,
  DraggableData,
  DroppableData
>;

export class MouseSensor<
  DraggableData,
  DroppableData
> extends AbstractPointerSensor<DraggableData, DroppableData> {
  constructor(props: MouseSensorProps<DraggableData, DroppableData>) {
    super(props, events, getOwnerDocument(props.event.target));
  }

  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: (
        {nativeEvent: event}: MouseEvent,
        {onActivation}: MouseSensorOptions<AnyData, AnyData>
      ) => {
        if (event.button === MouseButton.RightClick) {
          return false;
        }

        onActivation?.({event});

        return true;
      },
    },
  ];
}
