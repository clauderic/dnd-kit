import type {Coordinates} from '@dnd-kit/geometry';

import {
  Plugin,
  type PluginOptions,
  type PluginConstructor,
  type PluginDescriptor,
} from '../plugins/index.ts';
import type {DragDropManager} from '../manager/index.ts';

export type ModifierOptions = PluginOptions;

export class Modifier<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends ModifierOptions = ModifierOptions,
> extends Plugin<T, U> {
  constructor(
    public manager: T,
    public options?: U
  ) {
    super(manager, options);
  }

  public apply(operation: T['dragOperation']): Coordinates {
    return operation.transform;
  }
}

export type ModifierConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginConstructor<T, Modifier<T, any>>;

export type ModifierDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginDescriptor<T, Modifier<T, any>, ModifierConstructor<T>>;

export type Modifiers<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (ModifierConstructor<T> | ModifierDescriptor<T>)[];
