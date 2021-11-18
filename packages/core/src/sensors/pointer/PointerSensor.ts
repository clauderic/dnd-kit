import type {PointerEvent} from 'react';
import {getOwnerDocument} from '@dnd-kit/utilities';

import type {SensorProps} from '../types';
import {
  AbstractPointerSensor,
  AbstractPointerSensorOptions,
  PointerEventHandlers,
} from './AbstractPointerSensor';

const events: PointerEventHandlers = {
  move: {name: 'pointermove'},
  end: {name: 'pointerup'},
};

export interface PointerSensorOptions extends AbstractPointerSensorOptions {}

export type PointerSensorProps = SensorProps<PointerSensorOptions>;

export class PointerSensor extends AbstractPointerSensor {
  constructor(props: PointerSensorProps) {
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
        {onActivation}: PointerSensorOptions
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
