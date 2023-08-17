import type {Coordinates} from '@dnd-kit/geometry';

import {
  Plugin,
  PluginOptions,
  type PluginConstructor,
  type PluginDescriptor,
} from '../plugins';

import type {DragDropManager, DragOperation} from '../manager';

export type ModifierOptions = PluginOptions;

export class Modifier<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Plugin<T> {
  constructor(
    protected manager: T,
    public options?: ModifierOptions
  ) {
    super(manager);
  }

  public apply(operation: DragOperation): Coordinates {
    return operation.transform;
  }
}

export type ModifierConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginConstructor<T, Modifier<T>>;

export type ModifierDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginDescriptor<T, Modifier<T>, ModifierConstructor<T>>;

export type Modifiers<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (ModifierConstructor<T> | ModifierDescriptor<T>)[];
