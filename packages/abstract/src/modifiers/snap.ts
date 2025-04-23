import {
  configurator,
  Modifier,
  type DragOperation,
  type DragDropManager,
  type Draggable,
  type Droppable,
} from '@dnd-kit/abstract';

/**
 * Options for configuring a snap modifier.
 *
 * @property size - The grid size to snap to, either a single number for both axes
 *                 or separate x and y values
 */
interface Options {
  size: number | {x: number; y: number};
}

/**
 * A modifier that snaps drag movement to a grid.
 *
 * @remarks
 * This modifier:
 * - Snaps drag coordinates to the nearest grid point
 * - Supports different grid sizes for x and y axes
 * - Uses ceiling rounding to ensure consistent snapping behavior
 *
 * @example
 * ```typescript
 * // Snap to a 20x20 grid
 * const modifier = SnapModifier.configure({ size: 20 });
 *
 * // Snap to a 10x20 grid
 * const modifier = SnapModifier.configure({ size: { x: 10, y: 20 } });
 * ```
 */
export class SnapModifier extends Modifier<
  DragDropManager<Draggable, Droppable>,
  Options
> {
  /**
   * Applies the snap grid to the drag operation.
   *
   * @param operation - The current drag operation
   * @returns The modified transform with coordinates snapped to the grid
   */
  apply({transform}: DragOperation) {
    const {size = 20} = this.options ?? {};
    const x = typeof size === 'number' ? size : size.x;
    const y = typeof size === 'number' ? size : size.y;

    return {
      ...transform,
      x: Math.ceil(transform.x / x) * x,
      y: Math.ceil(transform.y / y) * y,
    };
  }

  /**
   * Creates a configured instance of the SnapModifier.
   *
   * @param options - The snap grid options
   * @returns A configured SnapModifier instance
   */
  static configure = configurator(SnapModifier);
}
