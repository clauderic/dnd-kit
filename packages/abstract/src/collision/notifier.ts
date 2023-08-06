import {effect} from '@dnd-kit/state';
import {DragDropManager} from '../manager';
import {Plugin} from '../plugins';

export class CollisionNotifier extends Plugin {
  constructor(manager: DragDropManager) {
    super(manager);

    this.destroy = effect(() => {
      const {collisionObserver, monitor} = manager;
      const {collisions} = collisionObserver;

      monitor.dispatch('collision', {collisions});
    });
  }
}
