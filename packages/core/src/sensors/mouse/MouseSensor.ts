import type {MouseEvent} from 'react';
import {getOwnerDocument} from '@dnd-kit/utilities';

import type {SensorProps} from '../types';
import {
  AbstractPointerSensor,
  PointerEventHandlers,
  AbstractPointerSensorOptions,
} from '../pointer';

const events: PointerEventHandlers = {
  move: {name: 'mousemove'},
  end: {name: 'mouseup'},
};

enum MouseButton {
  RightClick = 2,
}

export interface MouseSensorOptions extends AbstractPointerSensorOptions {}

export type MouseSensorProps = SensorProps<MouseSensorOptions>;

export class MouseSensor extends AbstractPointerSensor {
  constructor(props: MouseSensorProps) {
    super(props, events, getOwnerDocument(props.event.target));
  }

  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: (
        {nativeEvent: event}: MouseEvent,
        {onActivation}: MouseSensorOptions
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
