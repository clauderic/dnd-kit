import {reactive, untracked} from '@dnd-kit/state';
import type {DragDropManager} from '../manager';

import type {PluginOptions} from './types';

/**
 * An abstract plugin class that can be extended to implement custom
 * functionality that augments the `DragDropManager`'s core capabilities.
 */
export class Plugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions | undefined = PluginOptions,
> {
  constructor(
    protected manager: T,
    public options?: U
  ) {}

  /**
   * Whether the plugin instance is disabled.
   * Triggers effects when accessed.
   */
  @reactive
  public disabled: boolean = false;

  /**
   * Enable a disabled plugin instance.
   * Triggers effects.
   */
  public enable() {
    this.disabled = false;
  }

  /**
   * Disable an enabled plugin instance.
   * Triggers effects.
   */
  public disable() {
    this.disabled = true;
  }

  /**
   * Whether the plugin instance is disabled.
   * Does not trigger effects when accessed.
   */
  public isDisabled() {
    return untracked(() => {
      return this.disabled;
    });
  }

  /**
   * Configure a plugin instance with new options.
   */
  public configure(options?: U) {
    this.options = options;
  }

  /**
   * Destroy a plugin instance.
   */
  public destroy() {
    /*
     * Each plugin is responsible for implementing its own
     * destroy method to clean up effects and listeners
     */
  }
}
