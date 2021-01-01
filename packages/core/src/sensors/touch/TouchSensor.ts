import React from 'react';

import {
  AbstractPointerSensor,
  PointerSensorProps,
  PointerEventHandlers,
  PointerSensorOptions,
} from '../pointer';

const events: PointerEventHandlers = {
  move: {name: 'touchmove'},
  end: {name: 'touchend'},
};

export interface TouchSensorOptions extends PointerSensorOptions {}

export class TouchSensor extends AbstractPointerSensor {
  constructor(props: PointerSensorProps) {
    super(props, events);
  }

  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: ({nativeEvent}: React.TouchEvent) => {
        const {touches} = nativeEvent;

        if (touches.length > 1) {
          return false;
        }

        if (nativeEvent.cancelable) {
          nativeEvent.preventDefault();
        }

        return true;
      },
    },
  ];
}
