import {effect, untracked} from '@dnd-kit/state';

import {DragDropManager} from '../manager/index.ts';
import {CorePlugin} from '../plugins/index.ts';
import {defaultPreventable} from '../manager/events.ts';

import type {Collision} from './types.ts';

export class CollisionNotifier extends CorePlugin {
  constructor(manager: DragDropManager<any, any>) {
    super(manager);

    const isEqual = (a: Collision[], b: Collision[]) =>
      a.map(({id}) => id).join('') === b.map(({id}) => id).join('');

    let previousCollisions: Collision[] = [];

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

      if (isEqual(collisions, previousCollisions)) {
        return;
      } else {
        previousCollisions = collisions;
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
