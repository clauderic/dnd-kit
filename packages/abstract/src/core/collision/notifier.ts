import {effect, untracked} from '@dnd-kit/state';

import {DragDropManager} from '../manager/index.js';
import {CorePlugin} from '../plugins/index.js';
import {defaultPreventable} from '../manager/events.js';

export class CollisionNotifier extends CorePlugin {
  constructor(manager: DragDropManager) {
    super(manager);

    this.destroy = effect(() => {
      const {collisionObserver, monitor} = manager;
      const {collisions} = collisionObserver;

      if (collisionObserver.isDisabled()) {
        return;
      }

      const event = defaultPreventable({
        collisions,
      });

      monitor.dispatch('collision', event);

      if (event.defaultPrevented) {
        return;
      }

      const [firstCollision] = collisions;

      untracked(() => {
        if (firstCollision?.id !== manager.dragOperation.target?.id) {
          collisionObserver.disable();

          manager.actions.setDropTarget(firstCollision?.id).then(() => {
            collisionObserver.enable();
          });
        }
      });
    });
  }
}
