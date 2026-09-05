import {batch, CleanupFunction, effect} from '@dnd-kit/state';
import {CollisionPlugin} from '@dnd-kit/abstract';
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
import {createCollisionSuspension} from './collisionSuspension.ts';

const TOLERANCE = 10;

export class SortableKeyboardPlugin extends CollisionPlugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const suspensions = createCollisionSuspension(manager, () =>
      this.beginCollisionTransaction()
    );
    let destroyed = false;
    let commands:
      | {controller: AbortController; directions: Direction[]; running: boolean}
      | undefined;

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

    const run = async (queue: NonNullable<typeof commands>) => {
      queue.running = true;
      const suspension = suspensions.acquire();
      if (!suspension) {
        queue.running = false;
        queue.directions.length = 0;
        return;
      }

      const current = () =>
        suspension.current &&
        !this.disabled &&
        suspension.controller === queue.controller;

      try {
        while (queue.directions.length && current()) {
          const direction = queue.directions.shift()!;
          const {dragOperation, actions, collisionObserver, registry} = manager;
          const {source, target, shape} = dragOperation;
          if (!isSortable(source) || !shape) return;

          suspension.include([source.sortable.droppable]);
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

          suspension.include(potentialTargets);
          const [firstCollision] = collisions;
          if (!firstCollision || !current()) continue;

          const {id} = firstCollision;
          const {index, group} = source.sortable;
          if (!(await suspension.waitFor(actions.setDropTarget(id)))) return;
          if (!current()) return;

          // Optimistic sorting acquires its own token during setDropTarget's
          // synchronous dragover dispatch. Wait for that commit explicitly.
          await suspension.waitForOthers();
          if (!current()) return;

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
          if (!element) continue;

          suspension.include([updatedSource.sortable.droppable, updatedTarget]);
          scrollIntoViewIfNeeded(element);
          const updatedShape = new DOMRectangle(element);
          const delta = Rectangle.delta(
            updatedShape,
            Rectangle.from(updatedDragShape.current.boundingRectangle),
            updatedSource.alignment
          );

          if (!current()) return;
          suspension.run(() => actions.move({by: delta}));

          if (updated) {
            if (
              !(await suspension.waitFor(
                actions.setDropTarget(updatedSource.id)
              ))
            )
              return;
          } else {
            if (!(await suspension.waitFor(manager.renderer.rendering))) return;
          }
          // The queued position write runs before these render continuations.
          // Keep ownership through it, including when no sortable index changed.
        }
      } finally {
        queue.running = false;
        queue.directions.length = 0;
        suspension.release();
      }
    };

    const unsubscribe = manager.monitor.addEventListener(
      'dragmove',
      (event) => {
        const {controller, source} = manager.dragOperation;
        if (!controller || !event.by || !isKeyboardEvent(event.nativeEvent))
          return;
        if (!isSortable(source)) return;
        const sourceId = source.id;
        const direction = getDirection(event.by);
        if (!direction) return;
        const admission = suspensions.acquire();
        if (!admission) return;

        queueMicrotask(() => {
          try {
            const {dragOperation} = manager;
            if (
              destroyed ||
              this.disabled ||
              event.defaultPrevented ||
              controller.signal.aborted ||
              dragOperation.controller !== controller ||
              !dragOperation.status.dragging ||
              !isSortable(dragOperation.source) ||
              dragOperation.source.id !== sourceId ||
              !dragOperation.shape
            ) {
              return;
            }

            // Prevent the sensor's queued movement even when another command is
            // still rendering. Accepted arrow presses are processed in order.
            event.preventDefault();
            if (commands?.controller !== controller) {
              commands = {controller, directions: [], running: false};
            }
            commands.directions.push(direction);
            if (!commands.running) void run(commands);
          } finally {
            admission.release();
          }
        });
      }
    );

    this.destroy = () => {
      destroyed = true;
      if (commands) commands.directions.length = 0;
      unsubscribe();
      cleanupEffect();
      suspensions.destroy();
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
