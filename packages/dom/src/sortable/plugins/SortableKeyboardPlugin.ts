import {batch, CleanupFunction, effect} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {closestCorners} from '@dnd-kit/collision';
import {
  DOMRectangle,
  getVisibleBoundingRectangle,
  isKeyboardEvent,
  scrollIntoViewIfNeeded,
} from '@dnd-kit/dom/utilities';
import {Rectangle, type Coordinates} from '@dnd-kit/geometry';
import {Scroller} from '@dnd-kit/dom';
import type {DragDropManager, Droppable} from '@dnd-kit/dom';

import {isSortable} from '../utilities.ts';

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
      (event, manager: DragDropManager) => {
        queueMicrotask(() => {
          if (this.disabled || event.defaultPrevented || !event.nativeEvent) {
            return;
          }

          const {dragOperation} = manager;

          if (!isKeyboardEvent(event.nativeEvent)) {
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
          const {source, target} = dragOperation;
          const {center} = dragOperation.shape.current;
          const potentialTargets: Droppable[] = [];
          const cleanup: CleanupFunction[] = [];

          batch(() => {
            for (const droppable of registry.droppables) {
              const {id} = droppable;

              if (
                !droppable.accepts(source) ||
                (id === target?.id && isSortable(droppable)) ||
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
          const {index, group} = source.sortable;

          actions.setDropTarget(id).then(() => {
            // Wait until optimistic sorting has a chance to update the DOM
            const {source, target, shape} = dragOperation;

            if (!source || !isSortable(source) || !shape) {
              return;
            }

            const {
              index: newIndex,
              group: newGroup,
              target: targetElement,
            } = source.sortable;
            const updated = index !== newIndex || group !== newGroup;
            const element = updated ? targetElement : target?.element;

            if (!element) return;

            scrollIntoViewIfNeeded(element);
            const updatedShape = new DOMRectangle(element);

            if (!updatedShape) {
              return;
            }

            const delta = Rectangle.delta(
              updatedShape,
              Rectangle.from(shape.current.boundingRectangle),
              source.alignment
            );

            actions.move({
              by: delta,
            });

            if (updated) {
              actions
                .setDropTarget(source.id)
                .then(() => collisionObserver.enable());
            } else {
              collisionObserver.enable();
            }
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
