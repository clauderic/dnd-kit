import type {Draggable, Droppable} from '../nodes';
import {CollisionObserver} from '../collision';
import type {Collisions} from '../collision';

import {DragOperationManager, DragOperation} from './dragOperation';
import {DragDropRegistry} from './registry';
import {Plugin, PluginConstructor} from '../plugin';

export interface DragDropConfiguration {
  plugins: PluginConstructor[];
}

export type DragDropManagerInput = Partial<DragDropConfiguration>;

export class DragDropManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> {
  public actions: DragOperationManager<T, U>['actions'];
  public collisionObserver: CollisionObserver;
  public dragOperation: DragOperation<T, U>;
  public plugins: Plugin[];
  public registry: DragDropRegistry<T, U>;

  constructor(config?: DragDropManagerInput) {
    const {plugins = []} = config ?? {};
    const registry = new DragDropRegistry<T, U>();
    const {actions, operation} = DragOperationManager<T, U>({
      registry,
    });
    const collisionObserver = new CollisionObserver({
      dragOperation: operation,
      registry,
    });

    this.actions = actions;
    this.collisionObserver = collisionObserver;
    this.registry = registry;
    this.dragOperation = operation;
    this.plugins = plugins.map((Plugin) => new Plugin(this));
  }

  public destroy() {
    this.plugins.forEach((plugin) => plugin.destroy());
  }
}
