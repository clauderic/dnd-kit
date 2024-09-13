import {batch, CleanupFunction, effect} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {closestCorners} from '@dnd-kit/collision';
import {
  DOMRectangle,
  getVisibleBoundingRectangle,
  isKeyboardEvent,
  scheduler,
  scrollIntoViewIfNeeded,
} from '@dnd-kit/dom/utilities';
import type {Coordinates} from '@dnd-kit/geometry';

import {Scroller} from '@dnd-kit/dom';
import type {DragDropManager, Droppable} from '@dnd-kit/dom';

import {isSortable} from './utilities.ts';

const TOLERANCE = 10;

export class SortableKeyboardPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const cleanupEffect = effect(() => {
      const {dragOperation} = manager;

      if (!isKeyboardEvent(dragOperation.activatorEvent)) {
        return;
      }

      if (!isSortable(dragOperation.source)) {
        return;
      }

      if (dragOperation.status.initialized) {
        const scroller = manager.registry.plugins.get(Scroller);

        if (scroller) {
          scroller.disable();

          return () => scroller.enable();
        }
      }
    });

    const unsubscribe = manager.monitor.addEventListener(
      'dragmove',
      (event, manager) => {
        queueMicrotask(() => {
          if (this.disabled || event.defaultPrevented) {
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
          const {source} = dragOperation;
          const {center} = dragOperation.shape.current;
          const potentialTargets: Droppable[] = [];
          const cleanup: CleanupFunction[] = [];

          batch(() => {
            for (const droppable of registry.droppables) {
              const {id} = droppable;

              if (
                !droppable.accepts(source) ||
                (id === source?.id && isSortable(droppable)) ||
                !droppable.element
              ) {
                continue;
              }

              let previousShape = droppable.shape;
              const shape = new DOMRectangle(droppable.element, {
                getBoundingClientRect: (element) =>
                  getVisibleBoundingRectangle(element, undefined, 0.2),
              });

              if (!shape.height || !shape.width) continue;

              if (
                (direction == 'down' &&
                  center.y + TOLERANCE < shape.center.y) ||
                (direction == 'up' && center.y - TOLERANCE > shape.center.y) ||
                (direction == 'left' &&
                  center.x - TOLERANCE > shape.center.x) ||
                (direction == 'right' && center.x + TOLERANCE < shape.center.x)
              ) {
                potentialTargets.push(droppable);
                droppable.shape = shape;
                cleanup.push(() => (droppable.shape = previousShape));
              }
            }
          });

          event.preventDefault();
          collisionObserver.disable();

          const collisions = collisionObserver.computeCollisions(
            potentialTargets,
            closestCorners
          );
          batch(() => cleanup.forEach((clean) => clean()));

          const [firstCollision] = collisions;

          if (!firstCollision) {
            return;
          }

          const {id} = firstCollision;

          actions.setDropTarget(id).then(() => {
            // Wait until optimistic sorting has a chance to update the DOM
            queueMicrotask(() => {
              const {source} = dragOperation;

              if (!source || !isSortable(source)) {
                return;
              }

              const {element} = source.sortable;

              if (!element) return;

              scrollIntoViewIfNeeded(element);
              scheduler.schedule(() => {
                const shape = new DOMRectangle(element);

                if (!shape) {
                  return;
                }

                actions.move({
                  to: {
                    x: shape.center.x,
                    y: shape.center.y,
                  },
                });

                actions.setDropTarget(source.id).then(() => {
                  collisionObserver.enable();
                });
              });
            });
          });
        });
      }
    );

    this.destroy = () => {
      unsubscribe();
      cleanupEffect();
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
