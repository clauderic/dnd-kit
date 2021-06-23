import type {MouseEvent} from 'react';

import {getOwnerDocument} from '../../utilities';
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

const defaultTriggerFunction = ({event}: {event: MouseEvent}) =>
  event.button !== MouseButton.RightClick;

export interface MouseSensorOptions
  extends AbstractPointerSensorOptions<MouseEvent> {}

export type MouseSensorProps = SensorProps<MouseSensorOptions>;

export class MouseSensor extends AbstractPointerSensor<MouseEvent> {
  constructor(props: MouseSensorProps) {
    super(props, events, getOwnerDocument(props.event.target));
  }

  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: (
        {nativeEvent: event}: React.SyntheticEvent<Element, MouseEvent>,
        {
          onActivation,
          triggerFunction = defaultTriggerFunction,
        }: MouseSensorOptions
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
