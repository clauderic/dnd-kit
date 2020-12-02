import React from 'react';

import {
  PointerSensor,
  PointerSensorProps,
  PointerEventHandlers,
  PointerSensorOptions,
} from '../pointer';

const events: PointerEventHandlers = {
  move: {name: 'touchmove'},
  end: {name: 'touchend'},
};

export interface TouchSensorOptions extends PointerSensorOptions {}

export class TouchSensor extends PointerSensor {
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

        nativeEvent.preventDefault();

        if (nativeEvent.target instanceof HTMLElement) {
          nativeEvent.target.focus();
        }

        return true;
      },
    },
  ];
}
