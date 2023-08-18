import {effect, untracked} from '@dnd-kit/state';

import {DragDropManager} from '../manager';
import {CorePlugin} from '../plugins';

export class CollisionNotifier extends CorePlugin {
  constructor(manager: DragDropManager) {
    super(manager);

    let timeout: NodeJS.Timeout | undefined;

    this.destroy = effect(() => {
      const {collisionObserver, monitor} = manager;
      const {collisions} = collisionObserver;

      if (collisionObserver.isDisabled()) {
        return;
      }

      let defaultPrevented = false;

      monitor.dispatch('collision', {
        collisions,
        get defaultPrevented() {
          return defaultPrevented;
        },
        preventDefault() {
          defaultPrevented = true;
        },
      });

      if (defaultPrevented) {
        return;
      }

      const [firstCollision] = collisions;

      untracked(() => {
        if (firstCollision?.id !== manager.dragOperation.target?.id) {
          if (timeout) {
            return;
          }

          timeout = setTimeout(() => {
            collisionObserver.disable();

            manager.actions.setDropTarget(firstCollision?.id).then(() => {
              collisionObserver.enable();
            });
            timeout = undefined;
          }, 50);
        }
      });
    });
  }
}
