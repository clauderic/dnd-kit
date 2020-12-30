import {getOwnerDocument} from '../../utilities';

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
    // Pointer events stop firing if the target is unmounted while dragging
    // Therefore we attach listeners to the owner document instead
    const listenerTarget = getOwnerDocument(event.target);

    super(props, events, listenerTarget);
  }

  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({nativeEvent}: React.PointerEvent) => {
        if (!nativeEvent.isPrimary || nativeEvent.button !== 0) {
          return false;
        }

        nativeEvent.preventDefault();

        return true;
      },
    },
  ];
}
