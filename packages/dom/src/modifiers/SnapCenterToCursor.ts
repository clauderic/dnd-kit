import { Modifier, type DragOperation } from '@dnd-kit/abstract'
import type { DragDropManager } from '@dnd-kit/dom'
import { getEventCoordinates } from '@dnd-kit/utilities'

export class SnapCenterToCursor extends Modifier<
  DragDropManager<Draggable, Droppable>
> {
  apply({shape, position, transform}: DragOperation) {
    if (!position.initial || !shape) {
      return transform;
    }

    const {initial, current} = shape;
    const {left, top} = initial.boundingRectangle;
    const {height, width} = current.boundingRectangle;

    const offsetX = position.initial.x - left;
    const offsetY = position.initial.y - top;

    return {
      ...transform,
      x: transform.x + offsetX - width / 2,
      y: transform.y + offsetY - height / 2,
    };
  }
}
