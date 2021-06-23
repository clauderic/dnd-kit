import type {TouchEvent} from 'react';

import {
  AbstractPointerSensor,
  PointerEventHandlers,
  AbstractPointerSensorOptions,
} from '../pointer';
import type {SensorProps} from '../types';

const events: PointerEventHandlers = {
  move: {name: 'touchmove'},
  end: {name: 'touchend'},
};

const defaultTriggerFunction = ({event}: {event: TouchEvent}) =>
  event.touches.length === 1;

export interface TouchSensorOptions
  extends AbstractPointerSensorOptions<TouchEvent> {}

export type TouchSensorProps = SensorProps<TouchSensorOptions>;

export class TouchSensor extends AbstractPointerSensor<TouchEvent> {
  constructor(props: TouchSensorProps) {
    super(props, events);
  }

  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: (
        {nativeEvent: event}: React.SyntheticEvent<Element, TouchEvent>,
        {
          onActivation,
          triggerFunction = defaultTriggerFunction,
        }: TouchSensorOptions
      ) => {
        if (triggerFunction?.({event})) {
          onActivation?.({event});
          return true;
        }

        return false;
      },
    },
  ];
}
