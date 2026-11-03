import {effects, untracked} from '@dnd-kit/state';
import {Point} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';

import {Entity} from '../entities/index.ts';
import type {UniqueIdentifier} from '../entities/index.ts';
import {DragDropManager} from '../manager/index.ts';
import {CorePlugin} from '../plugins/index.ts';
import {defaultPreventable} from '../manager/events.ts';

import type {Collision} from './types.ts';

/**
 * A droppable that was recently set or cleared as the drop target, along with
 * the pointer coordinates at which that change happened.
 */
interface RecentTarget {
  id: UniqueIdentifier;
  coordinates: Coordinates;
}

const MAX_RECENT_TARGETS = 10;

export class CollisionNotifier extends CorePlugin {
  /**
   * Minimum distance in pixels that the pointer needs to travel before a
   * droppable that was recently set or cleared as the drop target can become
   * the drop target again.
   *
   * @remarks
   * Setting a drop target can cause layout shifts, for example when items are
   * optimistically re-ordered across columns. Those layout shifts can change
   * the outcome of collision detection at the same pointer position, which
   * would immediately re-target the previous droppable and oscillate back and
   * forth between the two on every pointer movement. Requiring a minimum
   * amount of pointer travel before re-targeting a recent drop target breaks
   * that cycle, while deliberate pointer movements remain unaffected.
   */
  public static hysteresis = 10;

  constructor(manager: DragDropManager<any, any>) {
    super(manager);

    const isEqual = (a: Collision[], b: Collision[]) =>
      a.map(({id}) => id).join('') === b.map(({id}) => id).join('');

    let previousCollisions: Collision[] = [];
    let recentTargets: RecentTarget[] = [];
    let suppressed = false;

    const record = (id: UniqueIdentifier, coordinates: Coordinates) => {
      recentTargets = recentTargets.filter((entry) => entry.id !== id);
      recentTargets.push({id, coordinates});

      if (recentTargets.length > MAX_RECENT_TARGETS) {
        recentTargets.shift();
      }
    };

    this.destroy = effects(
      () => {
        const {dragOperation, collisionObserver} = manager;

        if (dragOperation.status.initializing) {
          previousCollisions = [];
          recentTargets = [];
          suppressed = false;
          collisionObserver.enable();
        }
      },
      () => {
        const {collisionObserver, monitor} = manager;
        const {collisions} = collisionObserver;

        if (collisionObserver.isDisabled()) {
          return;
        }

        if (Entity.pendingIdChanges) {
          return;
        }

        const event = defaultPreventable({
          collisions,
        });

        monitor.dispatch('collision', event);

        if (event.defaultPrevented) {
          return;
        }

        /* While a re-target is being suppressed, keep re-evaluating pointer
         * travel on every update, even if the detected collisions have not
         * changed since the previous update. */
        if (!suppressed && isEqual(collisions, previousCollisions)) {
          return;
        }

        previousCollisions = collisions;

        const [firstCollision] = collisions;

        untracked(() => {
          const {dragOperation} = manager;
          const id = firstCollision?.id ?? null;
          const targetId = dragOperation.target?.id ?? null;

          if (id === targetId) {
            suppressed = false;
            return;
          }

          const coordinates = dragOperation.position.current;
          const {hysteresis} = CollisionNotifier;

          recentTargets = recentTargets.filter(
            (entry) =>
              Point.distance(entry.coordinates, coordinates) < hysteresis
          );

          if (id != null && recentTargets.some((entry) => entry.id === id)) {
            /* The droppable with the greatest collision was recently set or
             * cleared as the drop target, and the pointer has barely moved
             * since. This is a strong signal that the collision was caused by
             * a layout shift in response to the previous drop target change
             * rather than by user intent, so ignore it to avoid oscillating
             * between drop targets. */
            suppressed = true;
            return;
          }

          suppressed = false;

          if (targetId != null) {
            record(targetId, coordinates);
          }

          if (id != null) {
            record(id, coordinates);
          }

          collisionObserver.disable();

          manager.actions.setDropTarget(id).then(() => {
            collisionObserver.enable();
          });
        });
      }
    );
  }
}
