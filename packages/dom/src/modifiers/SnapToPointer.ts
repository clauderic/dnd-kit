import {Modifier, configurator} from '@dnd-kit/abstract';
import type {DragOperation} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';

type Anchor = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface Options {
  anchor?: Anchor;
}

export class SnapToPointer extends Modifier<DragDropManager, Options> {
  apply({activatorEvent, shape, transform}: DragOperation) {
    if (!shape || !(activatorEvent instanceof PointerEvent)) {
      return transform;
    }

    const anchor = this.options?.anchor ?? 'center';
    const {boundingRectangle, center} = shape.initial;

    let anchorX: number;
    let anchorY: number;

    switch (anchor) {
      case 'top-left':
        anchorX = boundingRectangle.left;
        anchorY = boundingRectangle.top;
        break;
      case 'top-right':
        anchorX = boundingRectangle.right;
        anchorY = boundingRectangle.top;
        break;
      case 'bottom-left':
        anchorX = boundingRectangle.left;
        anchorY = boundingRectangle.bottom;
        break;
      case 'bottom-right':
        anchorX = boundingRectangle.right;
        anchorY = boundingRectangle.bottom;
        break;
      default:
        anchorX = center.x;
        anchorY = center.y;
    }

    return {
      x: transform.x + activatorEvent.clientX - anchorX,
      y: transform.y + activatorEvent.clientY - anchorY,
    };
  }

  static configure = configurator(SnapToPointer);
}
