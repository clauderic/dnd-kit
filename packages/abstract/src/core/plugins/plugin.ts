import {
  type CleanupFunction,
  effect,
  reactive,
  untracked,
} from '@dnd-kit/state';

import type {DragDropManager} from '../manager/index.ts';
import type {PluginOptions} from './types.ts';
import {configure} from './utilities.ts';

/**
 * Base class for plugins that extend drag and drop functionality.
 *
 * @template T - The type of drag and drop manager
 * @template U - The type of plugin options
 *
 * @remarks
 * Plugins can add new features and behaviors to the drag and drop system
 * by extending this class and implementing custom functionality.
 */
export abstract class Plugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions = PluginOptions,
> {
  /**
   * Creates a new plugin instance.
   *
   * @param manager - The drag and drop manager that owns this plugin
   * @param options - Optional configuration for the plugin
   */
  constructor(
    public manager: T,
    public options?: U
  ) {}

  /**
   * Whether the plugin instance is disabled.
   *
   * @remarks
   * This property is reactive and triggers effects when accessed.
   */
  @reactive
  public accessor disabled: boolean = false;

  /**
   * Enables a disabled plugin instance.
   *
   * @remarks
   * This method triggers effects when called.
   */
  public enable() {
    this.disabled = false;
  }

  /**
   * Disables an enabled plugin instance.
   *
   * @remarks
   * This method triggers effects when called.
   */
  public disable() {
    this.disabled = true;
  }

  /**
   * Checks if the plugin instance is disabled.
   *
   * @returns true if the plugin is disabled
   * @remarks
   * This method does not trigger effects when accessed.
   */
  public isDisabled() {
    return untracked(() => {
      return this.disabled;
    });
  }

  /**
   * Configures a plugin instance with new options.
   *
   * @param options - The new options to apply
   */
  public configure(options?: U) {
    this.options = options;
  }

  #cleanupFunctions = new Set<CleanupFunction>();

  /**
   * Registers an effect that will be cleaned up when the plugin is destroyed.
   *
   * @param callback - The effect callback to register
   * @returns A function to dispose of the effect
   */
  protected registerEffect(callback: () => void) {
    const dispose = effect(callback.bind(this));

    this.#cleanupFunctions.add(dispose);

    return dispose;
  }

  /**
   * Destroys a plugin instance and cleans up its resources.
   *
   * @remarks
   * This method:
   * - Calls all registered cleanup functions
   * - Should be overridden by subclasses to clean up additional resources
   */
  public destroy() {
    this.#cleanupFunctions.forEach((cleanup) => cleanup());
  }

  /**
   * Configures a plugin constructor with options.
   *
   * @param options - The options to configure the constructor with
   * @returns The configured plugin constructor
   *
   * @remarks
   * This method is used to configure the options that the
   * plugin constructor will use to create plugin instances.
   */
  static configure(options: PluginOptions) {
    return configure(this as any, options);
  }
}

/**
 * Base class for core plugins that ship with the library.
 *
 * @template T - The type of drag and drop manager
 * @template U - The type of plugin options
 */
export class CorePlugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions = PluginOptions,
> extends Plugin<T, U> {}
