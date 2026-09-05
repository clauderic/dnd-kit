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
import {createDragTasks} from '../../../../abstract/src/utilities/dragTasks.ts';

const TOLERANCE = 10;

export class SortableKeyboardPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const tasks = createDragTasks(manager, () => !this.disabled);

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
      (event) => {
        const {controller, source} = manager.dragOperation;
        if (!controller || !event.by || !isKeyboardEvent(event.nativeEvent))
          return;
        if (!isSortable(source)) return;
        const direction = getDirection(event.by);
        if (!direction) return;
        return tasks.run(async (task) => {
          if (
            !task.current ||
            event.defaultPrevented ||
            !manager.dragOperation.shape
          )
            return;
          event.preventDefault();
          const {dragOperation, actions, collisionObserver, registry} = manager;
          const {source, target, shape} = dragOperation;
          if (!isSortable(source) || !shape) return;

          const {center} = shape.current;
          const potentialTargets: Droppable[] = [];
          const cleanup: CleanupFunction[] = [];

          // Neither reactive observers nor the automatic collision pass may
          // see the keyboard query's temporary visible rectangles.
          const collisions = batch(() => {
            try {
              for (const droppable of registry.droppables) {
                const {id, element} = droppable;

                if (
                  droppable.disabled ||
                  !droppable.accepts(source) ||
                  id === source.id ||
                  (id === target?.id && isSortable(droppable)) ||
                  !element
                ) {
                  continue;
                }

                const previousShape = droppable.shape;
                const shape = new DOMRectangle(element, {
                  getBoundingClientRect: (element) =>
                    getVisibleBoundingRectangle(element, undefined, 0.2),
                });

                if (!shape.height || !shape.width) continue;

                if (
                  (direction == 'down' &&
                    center.y + TOLERANCE < shape.center.y) ||
                  (direction == 'up' &&
                    center.y - TOLERANCE > shape.center.y) ||
                  (direction == 'left' &&
                    center.x - TOLERANCE > shape.center.x) ||
                  (direction == 'right' &&
                    center.x + TOLERANCE < shape.center.x)
                ) {
                  potentialTargets.push(droppable);
                  cleanup.push(() => (droppable.shape = previousShape));
                  droppable.shape = shape;
                }
              }

              return collisionObserver.computeCollisions(
                potentialTargets,
                closestCorners
              );
            } finally {
              for (const restore of cleanup) restore();
            }
          });

          // Keep keyboard reordering within the current group when a sibling
          // exists in that direction. A nested child's nearer corners should
          // not intercept a reversal across its parent. Explicit higher
          // collision priorities still take precedence.
          const firstCollision =
            collisions.find(({id, priority}) => {
              const target = registry.droppables.get(id);
              return (
                priority === collisions[0]?.priority &&
                target != null &&
                isSortable(target) &&
                target.sortable.group === source.sortable.group
              );
            }) ?? collisions[0];
          if (!firstCollision || !task.current) return;

          const {id} = firstCollision;
          const {index, group} = source.sortable;
          if (!(await task.waitFor(actions.setDropTarget(id)))) return;
          if (!task.current) return;

          const {
            source: updatedSource,
            target: updatedTarget,
            shape: updatedDragShape,
          } = dragOperation;
          if (
            !isSortable(updatedSource) ||
            updatedSource.id !== source.id ||
            !updatedDragShape
          )
            return;
          if (
            !updatedTarget ||
            (updatedTarget.id !== id && updatedTarget.id !== updatedSource.id)
          ) {
            return;
          }
          if (updatedTarget.disabled || !updatedTarget.accepts(updatedSource))
            return;

          const {
            index: newIndex,
            group: newGroup,
            target: targetElement,
          } = updatedSource.sortable;
          const updated = index !== newIndex || group !== newGroup;
          const element = updated ? targetElement : updatedTarget.element;
          if (!element) return;

          scrollIntoViewIfNeeded(element);
          const updatedShape = new DOMRectangle(element);
          const delta = Rectangle.delta(
            updatedShape,
            Rectangle.from(updatedDragShape.current.boundingRectangle),
            updatedSource.alignment
          );

          if (!task.current) return;
          // Finish the original accepted move. A second action would be new
          // input after stop and would dispatch an artificial dragmove event.
          dragOperation.position.current = {
            x: dragOperation.position.current.x + delta.x,
            y: dragOperation.position.current.y + delta.y,
          };

          if (updated) {
            if (!(await task.waitFor(actions.setDropTarget(updatedSource.id))))
              return;
          } else {
            if (!(await task.waitFor(manager.renderer.rendering))) return;
          }
        });
      }
    );

    this.destroy = () => {
      unsubscribe();
      cleanupEffect();
      tasks.destroy();
    };
  }
}

type Direction = 'right' | 'left' | 'down' | 'up';

function getDirection(delta: Coordinates): Direction | undefined {
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
