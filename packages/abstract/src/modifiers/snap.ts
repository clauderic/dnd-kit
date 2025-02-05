import {
  configurator,
  Modifier,
  type DragOperation,
  type DragDropManager,
  type Draggable,
  type Droppable,
} from '@dnd-kit/abstract';

interface Options {
  size: number | { x: number; y: number };
}

export class SnapModifier extends Modifier<
  DragDropManager<Draggable, Droppable>,
  Options
> {
  apply({ transform }: DragOperation) {
    const { size = 20 } = this.options ?? {};
    const x = typeof size === 'number' ? size : size.x;
    const y = typeof size === 'number' ? size : size.y;

    return {
      ...transform,
      x: Math.ceil(transform.x / x) * x,
      y: Math.ceil(transform.y / y) * y,
    };
  }

  static configure = configurator(SnapModifier);
}

export class SnapCenterToCursor extends Modifier<
  DragDropManager<Draggable, Droppable>
> {
  apply({ shape, position, transform }: DragOperation) {
    if (!position.initial || !shape) {
      return transform;
    }

    const { initial, current } = shape;
    const { left, top } = initial.boundingRectangle;
    const { height, width } = current.boundingRectangle;

    const offsetX = position.initial.x - left;
    const offsetY = position.initial.y - top;

    return {
      ...transform,
      x: transform.x + offsetX - width / 2,
      y: transform.y + offsetY - height / 2,
    };
  }
}
