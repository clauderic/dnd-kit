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
   */
  public disabled: boolean = false;

  /**
   * Enable a disabled plugin instance.
   */
  public enable() {
    this.disabled = false;
  }

  /**
   * Disable an enabled plugin instance.
   */
  public disable() {
    this.disabled = true;
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
