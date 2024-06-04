import type {TouchEvent} from 'react';

import {
  AbstractPointerSensor,
  PointerSensorProps,
  PointerEventHandlers,
  PointerSensorOptions,
} from '../pointer';
import type {SensorProps} from '../types';
import type {AnyData} from '../../store';

const events: PointerEventHandlers = {
  move: {name: 'touchmove'},
  end: {name: 'touchend'},
};

export interface TouchSensorOptions<DraggableData, DroppableData>
  extends PointerSensorOptions<DraggableData, DroppableData> {}

export type TouchSensorProps<DraggableData, DroppableData> = SensorProps<
  TouchSensorOptions<DraggableData, DroppableData>,
  DraggableData,
  DroppableData
>;

export class TouchSensor<
  DraggableData,
  DroppableData
> extends AbstractPointerSensor<DraggableData, DroppableData> {
  constructor(props: PointerSensorProps<DraggableData, DroppableData>) {
    super(props, events);
  }

  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: (
        {nativeEvent: event}: TouchEvent,
        {onActivation}: TouchSensorOptions<AnyData, AnyData>
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

  static setup() {
    // Adding a non-capture and non-passive `touchmove` listener in order
    // to force `event.preventDefault()` calls to work in dynamically added
    // touchmove event handlers. This is required for iOS Safari.
    window.addEventListener(events.move.name, noop, {
      capture: false,
      passive: false,
    });

    return function teardown() {
      window.removeEventListener(events.move.name, noop);
    };

    // We create a new handler because the teardown function of another sensor
    // could remove our event listener if we use a referentially equal listener.
    function noop() {}
  }
}
