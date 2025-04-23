import type {Coordinates} from '@dnd-kit/geometry';

import {
  Plugin,
  type PluginOptions,
  type PluginConstructor,
  type PluginDescriptor,
} from '../plugins/index.ts';
import type {DragDropManager} from '../manager/manager.ts';
import type {DragOperationSnapshot} from '../manager/operation.ts';

/** Options that can be passed to a modifier */
export type ModifierOptions = PluginOptions;

/**
 * Base class for drag operation modifiers.
 *
 * @template T - The type of drag and drop manager
 * @template U - The type of modifier options
 *
 * @remarks
 * Modifiers can transform the coordinates of a drag operation,
 * enabling features like snapping, constraints, and custom behaviors.
 */
export class Modifier<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends ModifierOptions = ModifierOptions,
> extends Plugin<T, U> {
  /**
   * Creates a new modifier instance.
   *
   * @param manager - The drag and drop manager that owns this modifier
   * @param options - Optional configuration for the modifier
   */
  constructor(
    public manager: T,
    public options?: U
  ) {
    super(manager, options);
  }

  /**
   * Applies the modifier to the current drag operation.
   *
   * @param operation - The current state of the drag operation
   * @returns The transformed coordinates
   *
   * @remarks
   * Override this method to implement custom transformation logic.
   * The default implementation returns the original transform unchanged.
   */
  public apply(operation: DragOperationSnapshot<any, any>): Coordinates {
    return operation.transform;
  }
}

/**
 * Constructor type for modifiers.
 *
 * @template T - The type of drag and drop manager
 */
export type ModifierConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginConstructor<T, Modifier<T, any>>;

/**
 * Descriptor type for modifiers.
 *
 * @template T - The type of drag and drop manager
 */
export type ModifierDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginDescriptor<T, Modifier<T, any>, ModifierConstructor<T>>;

/**
 * Array type for modifier constructors or descriptors.
 *
 * @template T - The type of drag and drop manager
 */
export type Modifiers<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (ModifierConstructor<T> | ModifierDescriptor<T>)[];
