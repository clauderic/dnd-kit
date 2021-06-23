import type {PointerEvent} from 'react';

import {getOwnerDocument} from '../../utilities';
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

const defaultTriggerFunction = ({event}: {event: PointerEvent}) =>
  event.isPrimary && event.button === 0;

export interface PointerSensorOptions
  extends AbstractPointerSensorOptions<PointerEvent> {}

export type PointerSensorProps = SensorProps<PointerSensorOptions>;

export class PointerSensor extends AbstractPointerSensor<PointerEvent> {
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
        {nativeEvent: event}: React.SyntheticEvent<Element, PointerEvent>,
        {
          onActivation,
          triggerFunction = defaultTriggerFunction,
        }: PointerSensorOptions
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
