import {getOwnerDocument} from '../../utilities';
import {
  AbstractPointerSensor,
  PointerEventHandlers,
  PointerSensorOptions,
  PointerSensorProps,
} from '../pointer';

const events: PointerEventHandlers = {
  move: {name: 'mousemove'},
  end: {name: 'mouseup'},
};

enum MouseButton {
  RightClick = 2,
}

export interface MouseSensorOptions extends PointerSensorOptions {}

export class MouseSensor extends AbstractPointerSensor {
  constructor(props: PointerSensorProps) {
    super(props, events, getOwnerDocument(props.event.target));
  }

  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: ({nativeEvent}: React.MouseEvent) => {
        if (nativeEvent.button === MouseButton.RightClick) {
          return false;
        }

        nativeEvent.preventDefault();

        return true;
      },
    },
  ];
}
