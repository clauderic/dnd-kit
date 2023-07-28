import type {DragDropManager} from '../manager';

export class Plugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  constructor(protected manager: T) {
    this.manager = manager;
  }

  public disabled: boolean = false;

  public enable() {
    this.disabled = false;
  }

  public disable() {
    this.disabled = true;
  }

  public destroy() {
    // no-op
  }
}
