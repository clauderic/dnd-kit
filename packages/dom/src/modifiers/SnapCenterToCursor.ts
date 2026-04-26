import {Modifier, configurator} from '@dnd-kit/abstract';
import type {DragOperation} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';

export class SnapCenterToCursor extends Modifier<DragDropManager> {
  apply({activatorEvent, shape, transform}: DragOperation) {
    if (!shape || !(activatorEvent instanceof PointerEvent)) {
      return transform;
    }

    return {
      x: transform.x + activatorEvent.clientX - shape.initial.center.x,
      y: transform.y + activatorEvent.clientY - shape.initial.center.y,
    };
  }

  static configure = configurator(SnapCenterToCursor);
}
