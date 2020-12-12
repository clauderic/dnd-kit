import {getEventListenerTarget} from '../utilities';

import {
  AbstractPointerSensor,
  PointerSensorProps,
  PointerEventHandlers,
} from './AbstractPointerSensor';

const events: PointerEventHandlers = {
  move: {name: 'pointermove'},
  end: {name: 'pointerup'},
};

export class PointerSensor extends AbstractPointerSensor {
  constructor(props: PointerSensorProps) {
    const {event} = props;
    const listenerTarget = getEventListenerTarget(event.target);

    super(props, events, listenerTarget);

    if (
      event instanceof PointerEvent &&
      listenerTarget instanceof HTMLElement
    ) {
      listenerTarget.setPointerCapture(event.pointerId);
    }
  }

  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({nativeEvent}: React.PointerEvent) => {
        if (!nativeEvent.isPrimary) {
          return false;
        }

        nativeEvent.preventDefault();

        return true;
      },
    },
  ];
}
