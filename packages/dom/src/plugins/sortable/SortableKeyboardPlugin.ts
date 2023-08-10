import {batch, effect} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {closestCenter} from '@dnd-kit/collision';
import {
  scheduler,
  isKeyboardEvent,
  scrollIntoViewIfNeeded,
} from '@dnd-kit/dom-utilities';
import type {Coordinates} from '@dnd-kit/geometry';

import type {Droppable} from '../../nodes';
import {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';

import {isSortable} from './registry';
import {Scroller} from '../scrolling';

export class SortableKeyboardPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const effectCleanup = effect(() => {
      const {dragOperation} = manager;

      if (!isKeyboardEvent(dragOperation.activatorEvent)) {
        return;
      }

      if (!isSortable(dragOperation.source)) {
        return;
      }

      if (dragOperation.initialized) {
        const scroller = manager.plugins.get(Scroller);

        if (scroller) {
          scroller.disable();

          return () => scroller.enable();
        }
      }
    });

    const unsubscribe = manager.monitor.addEventListener(
      'dragmove',
      (event, manager) => {
        if (this.disabled) {
          return;
        }

        const {dragOperation} = manager;

        if (!isKeyboardEvent(dragOperation.activatorEvent)) {
          return;
        }

        if (!isSortable(dragOperation.source)) {
          return;
        }

        if (!dragOperation.shape) {
          return;
        }

        const {actions, collisionObserver, registry} = manager;
        const {by} = event;

        if (!by) {
          return;
        }

        const direction = getDirection(by);
        const {boundingRectangle} = dragOperation.shape;
        const potentialTargets: Droppable[] = [];

        for (const droppable of registry.droppable) {
          const {shape, id} = droppable;

          if (
            !shape ||
            (id === dragOperation.source?.id && isSortable(droppable))
          ) {
            continue;
          }

          switch (direction) {
            case 'down':
              if (boundingRectangle.top < shape.boundingRectangle.top) {
                potentialTargets.push(droppable);
              }
              break;
            case 'up':
              if (boundingRectangle.top > shape.boundingRectangle.top) {
                potentialTargets.push(droppable);
              }
              break;
            case 'left':
              if (boundingRectangle.left > shape.boundingRectangle.left) {
                potentialTargets.push(droppable);
              }
              break;
            case 'right':
              if (boundingRectangle.left < shape.boundingRectangle.left) {
                potentialTargets.push(droppable);
              }
              break;
          }
        }

        event.preventDefault();
        collisionObserver.disable();

        const collisions = collisionObserver.computeCollisions(
          potentialTargets,
          closestCenter
        );
        const [firstCollision] = collisions;

        if (!firstCollision) {
          return;
        }

        const {id} = firstCollision;

        actions.setDropTarget(id);

        scheduler.schedule(() => {
          const {shape, source} = dragOperation;

          if (!shape || !source?.element) {
            return;
          }

          scrollIntoViewIfNeeded(source.element);

          scheduler.schedule(() => {
            if (!source.element) {
              return;
            }

            const {center} = new DOMRectangle(source.element, true);

            batch(() => {
              actions.setDropTarget(source.id);
              actions.move({
                to: {
                  x: center.x,
                  y: center.y,
                },
              });
            });

            collisionObserver.enable();
          });
        }, true);
      }
    );

    this.destroy = () => {
      unsubscribe();
      effectCleanup();
    };
  }
}

function getDirection(delta: Coordinates) {
  const {x, y} = delta;

  if (x > 0) {
    return 'right';
  } else if (x < 0) {
    return 'left';
  } else if (y > 0) {
    return 'down';
  } else if (y < 0) {
    return 'up';
  }
}
