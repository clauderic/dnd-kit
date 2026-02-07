import {
  configurator,
  Modifier,
  type DragDropManager,
  type DragOperation,
} from '@dnd-kit/abstract';

/**
 * Options for configuring an axis modifier.
 *
 * @property axis - The axis to restrict movement to ('x' or 'y')
 * @property value - The fixed value to set for the specified axis
 */
interface Options {
  axis: 'x' | 'y';
  value: number;
}

/**
 * A modifier that restricts drag movement to a specific axis and value.
 *
 * @remarks
 * This modifier can be used to:
 * - Restrict movement to a specific axis
 * - Set a fixed value for the specified axis
 * - Create horizontal or vertical movement constraints
 */
export class AxisModifier extends Modifier<DragDropManager<any, any>, Options> {
  /**
   * Applies the axis restriction to the drag operation.
   *
   * @param operation - The current drag operation
   * @returns The modified transform with the axis restriction applied
   */
  apply({transform}: DragOperation) {
    if (!this.options) {
      return transform;
    }

    const {axis, value} = this.options;

    return {
      ...transform,
      [axis]: value,
    };
  }

  /**
   * Creates a configured instance of the AxisModifier.
   *
   * @param options - The axis restriction options
   * @returns A configured AxisModifier instance
   */
  static configure = configurator(AxisModifier);
}

/**
 * A pre-configured modifier that restricts movement to the vertical axis.
 *
 * @remarks
 * This modifier fixes the x-axis value to 0, allowing only vertical movement.
 */
export const RestrictToVerticalAxis = AxisModifier.configure({
  axis: 'x',
  value: 0,
});

/**
 * A pre-configured modifier that restricts movement to the horizontal axis.
 *
 * @remarks
 * This modifier fixes the y-axis value to 0, allowing only horizontal movement.
 */
export const RestrictToHorizontalAxis = AxisModifier.configure({
  axis: 'y',
  value: 0,
});
