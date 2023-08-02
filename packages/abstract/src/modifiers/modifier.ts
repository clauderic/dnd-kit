import type {Coordinates} from '@dnd-kit/geometry';

import {Plugin, type PluginConstructor} from '../plugins';

import type {DragDropManager, DragOperation} from '../manager';

export class Modifier<T extends DragDropManager<any, any>> extends Plugin<T> {
  constructor(manager: T) {
    super(manager);
  }

  public apply(operation: DragOperation): Coordinates {
    return operation.transform;
  }
}

export type ModifierConstructor<T extends DragDropManager<any, any>> =
  PluginConstructor<T, Modifier<T>>;
