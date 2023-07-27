import type {DragDropManager} from '../manager';

export abstract class Plugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  constructor(protected manager: T) {
    this.manager = manager;
  }

  public abstract destroy(): void;
}
