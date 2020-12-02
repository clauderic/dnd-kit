import React from 'react';

import {
  PointerSensor,
  PointerSensorProps,
  PointerEventHandlers,
  PointerSensorOptions,
} from '../pointer';
import {getOwnerDocument} from '../../utilities';

const events: PointerEventHandlers = {
  move: {name: 'touchmove'},
  end: {name: 'touchend'},
};

export interface TouchSensorOptions extends PointerSensorOptions {}

export class TouchSensor extends PointerSensor {
  constructor(props: PointerSensorProps) {
    const {
      event: {target},
    } = props;
    const listenerTarget =
      target instanceof HTMLElement ? target : getOwnerDocument(target);

    super(props, events, listenerTarget);
  }

  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: ({nativeEvent}: React.TouchEvent) => {
        nativeEvent.preventDefault();

        if (nativeEvent.target instanceof HTMLElement) {
          nativeEvent.target.focus();
        }

        return true;
      },
    },
  ];
}
