import {effect} from '@dnd-kit/state';
import {DragDropManager} from '../manager';
import {Plugin} from '../plugins';

export class CollisionNotifier extends Plugin {
  constructor(manager: DragDropManager) {
    super(manager);

    this.destroy = effect(() => {
      const {collisionObserver, monitor} = manager;
      const {collisions} = collisionObserver;
      let defaultPrevented = false;

      monitor.dispatch('collision', {
        collisions,
        preventDefault() {
          console.log('prevent default');
          defaultPrevented = true;
        },
      });

      if (defaultPrevented) {
        return;
      }

      const [firstCollision] = collisions;

      manager.actions.setDropTarget(firstCollision?.id);
    });
  }
}
