import type {DragDropManager} from '../manager/index.ts';
import {Plugin} from '../plugins/plugin.ts';
import type {PluginOptions} from '../plugins/types.ts';
import {collisionState} from './state.ts';

/** Base class for plugins that coordinate work with collision delivery. */
export abstract class CollisionPlugin<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions = PluginOptions,
> extends Plugin<T, U> {
  /**
   * Holds collision notification and normal drop completion while a plugin
   * finishes work for the current drag operation. Detection remains available.
   *
   * Release in a `finally` block when work finishes, and release outstanding
   * transactions when the plugin is destroyed. Release is idempotent and does
   * not change `disabled`. Cancellation does not wait for transactions.
   *
   * `run` executes a synchronous continuation of already accepted input, allowing
   * it to finish movement while a normal drop is pending. It does nothing after
   * release or an operation reset; plugins must also check cancellation before
   * continuing asynchronous work.
   */
  protected beginCollisionTransaction(): {
    release(): void;
    run(callback: () => void): void;
  } {
    const release = collisionState(this.manager).begin();

    return {release, run: release.run};
  }
}
