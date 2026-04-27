import {Modifier, configurator} from '@dnd-kit/abstract';
import type {DragOperation} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';

interface Anchor {
  x: number;
  y: number;
}

interface Options {
  anchor?: Anchor;
}

const DEFAULT_ANCHOR: Anchor = {x: 0.5, y: 0.5};

export class SnapToPointer extends Modifier<DragDropManager, Options> {
  apply({activatorEvent, shape, transform}: DragOperation) {
    if (!shape || !(activatorEvent instanceof PointerEvent)) {
      return transform;
    }

    const anchor = this.options?.anchor ?? DEFAULT_ANCHOR;
    const {boundingRectangle} = shape.initial;

    const anchorX = boundingRectangle.left + boundingRectangle.width * anchor.x;
    const anchorY = boundingRectangle.top + boundingRectangle.height * anchor.y;

    return {
      x: transform.x + activatorEvent.clientX - anchorX,
      y: transform.y + activatorEvent.clientY - anchorY,
    };
  }

  static configure = configurator(SnapToPointer);
}
