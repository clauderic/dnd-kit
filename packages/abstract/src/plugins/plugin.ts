import type {DragDropManager} from '../manager';

import type {PluginOptions} from './types';

export class Plugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions = PluginOptions,
> {
  constructor(
    protected manager: T,
    options?: U
  ) {
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
