import {CleanupFunction} from '@dnd-kit/types';
import type {DragDropManager} from '../manager';

export abstract class Plugin<
  T extends DragDropManager<any, any> = DragDropManager
> {
  protected manager: T;

  constructor(manager: T) {
    this.manager = manager;
  }

  public abstract destroy: CleanupFunction;
}
