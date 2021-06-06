import type {TouchEvent} from 'react';

import {
  AbstractPointerSensor,
  PointerSensorProps,
  PointerEventHandlers,
  PointerSensorOptions,
} from '../pointer';
import type {SensorProps} from '../types';

const events: PointerEventHandlers = {
  move: {name: 'touchmove'},
  end: {name: 'touchend'},
};

export interface TouchSensorOptions extends PointerSensorOptions {}

export type TouchSensorProps = SensorProps<TouchSensorOptions>;

export class TouchSensor extends AbstractPointerSensor {
  constructor(props: PointerSensorProps) {
    super(props, events);
  }

  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: (
        {nativeEvent: event}: TouchEvent,
        {onActivation}: TouchSensorOptions
      ) => {
        const {touches} = event;

        if (touches.length > 1) {
          return false;
        }

        onActivation?.({event});

        return true;
      },
    },
  ];
}
