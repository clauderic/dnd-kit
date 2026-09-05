import {Plugin} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';
import {move} from '@dnd-kit/helpers';
import {batch} from '@dnd-kit/state';

import {Sortable, SortableDroppable} from '../sortable.ts';
import {isSortable} from '../utilities.ts';
import {
  getSortableIndices,
  hasChanged,
  type SortableInstances,
} from './OptimisticSortingPlugin.helpers.ts';
import {createCollisionSuspension} from './collisionSuspension.ts';

const defaultGroup = '__default__';

export class OptimisticSortingPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const suspensions = createCollisionSuspension(manager);
    let destroyed = false;

    const getSortableInstances = () => {
      const sortableInstances: SortableInstances = new Map();

      for (const droppable of manager.registry.droppables) {
        if (droppable instanceof SortableDroppable) {
          const {sortable} = droppable;
          const {group} = sortable;

          let instances = sortableInstances.get(group);

          if (!instances) {
            instances = new Set();
            sortableInstances.set(group, instances);
          }

          instances.add(sortable);
        }
      }

      return sortableInstances;
    };

    const unsubscribe = [
      manager.monitor.addEventListener('dragover', (event, manager) => {
        if (this.disabled) {
          return;
        }

        const {dragOperation} = manager;
        const {source, target} = dragOperation;

        if (!isSortable(source) || !isSortable(target)) {
          return;
        }

        if (source.sortable === target.sortable) {
          return;
        }

        const instances = getSortableInstances();
        const sortableIndices = getSortableIndices(instances);
        const sameGroup = source.sortable.group === target.sortable.group;
        const sourceInstances = instances.get(source.sortable.group);
        const targetInstances = sameGroup
          ? sourceInstances
          : instances.get(target.sortable.group);

        if (!sourceInstances || !targetInstances) return;

        const sourceGroup = source.sortable.group;
        const targetGroup = target.sortable.group;
        const affected = () => {
          const instances = getSortableInstances();
          return [
            ...(instances.get(sourceGroup) ?? []),
            ...(instances.get(targetGroup) ?? []),
          ].map((sortable) => sortable.droppable);
        };
        // Acquire during dispatch, before either the notifier's render promise
        // or another dragover listener can finish this placement.
        const suspension = suspensions.acquire(affected());
        if (!suspension) return;

        const current = () =>
          suspension.current &&
          !this.disabled &&
          dragOperation.source?.id === source.id &&
          dragOperation.target?.id === target.id;

        queueMicrotask(async () => {
          try {
            if (!current() || event.defaultPrevented) return;

            // Give controlled sorting its commit before attempting a fallback.
            if (!(await suspension.waitFor(manager.renderer.rendering))) return;
            if (!current() || event.defaultPrevented) return;

            const newInstances = getSortableInstances();

            if (hasChanged(sortableIndices, instances, newInstances)) {
              // At least one index or group was changed so we should abort optimistic updates
              return;
            }

            const sourceElement = source.sortable.element;
            const targetElement = target.sortable.element;

            if (!targetElement || !sourceElement) {
              return;
            }

            if (!sameGroup && target.id === source.sortable.group) {
              return;
            }

            const orderedSourceSortables = sort(sourceInstances);
            const orderedTargetSortables = sameGroup
              ? orderedSourceSortables
              : sort(targetInstances);
            const sourceGroup = source.sortable.group ?? defaultGroup;
            const targetGroup = target.sortable.group ?? defaultGroup;
            const state = {
              [sourceGroup]: orderedSourceSortables,
              [targetGroup]: orderedTargetSortables,
            };
            const newState = move(state, event);

            if (state === newState) return;

            const sourceIndex = newState[targetGroup].indexOf(source.sortable);
            const targetIndex = newState[targetGroup].indexOf(target.sortable);

            reorder(sourceElement, sourceIndex, targetElement, targetIndex);

            batch(() => {
              for (const [index, sortable] of newState[sourceGroup].entries()) {
                sortable.index = index;
              }

              if (!sameGroup) {
                for (const [index, sortable] of newState[
                  targetGroup
                ].entries()) {
                  sortable.group = target.sortable.group;
                  sortable.index = index;
                }
              }
            });

            if (!current()) return;
            const acknowledgment = manager.actions.setDropTarget(source.id);
            // Release at the commit, before the action promise's completion
            // wakes terminal reconciliation. The source write is synchronous.
            acknowledgment.catch(() => {});
            await suspension.waitFor(manager.renderer.rendering);
          } finally {
            try {
              if (suspension.current) suspension.include(affected());
            } finally {
              suspension.release();
            }
          }
        });
      }),
      manager.monitor.addEventListener('dragend', (event, manager) => {
        if (!event.canceled) {
          return;
        }

        const {dragOperation} = manager;
        const {source, controller} = dragOperation;

        if (!controller || !isSortable(source)) {
          return;
        }

        if (
          source.sortable.initialIndex === source.sortable.index &&
          source.sortable.initialGroup === source.sortable.group
        ) {
          return;
        }

        // Cancellation has already aborted the controller. A rollback may
        // finish for that controller only, never for a subsequent drag.
        const current = () =>
          !destroyed &&
          dragOperation.controller === controller &&
          dragOperation.source?.id === source.id &&
          dragOperation.canceled;

        queueMicrotask(async () => {
          if (!current()) return;
          const instances = getSortableInstances();
          const sortableIndices = getSortableIndices(instances);
          const initialGroupInstances = instances.get(
            source.sortable.initialGroup
          );

          if (!initialGroupInstances) return;

          // Wait for the renderer to handle the event before attempting to optimistically update
          const rendered = await manager.renderer.rendering.then(
            () => true,
            () => false
          );
          if (rendered && current()) {
            const newInstances = getSortableInstances();

            if (hasChanged(sortableIndices, instances, newInstances)) {
              // At least one index or group was changed so we should abort optimistic updates
              return;
            }

            const currentSortables = sort(initialGroupInstances);
            const initialSortables = sort(
              initialGroupInstances,
              sortByInitialIndex
            );
            const sourceElement = source.sortable.element;
            const initialPosition = initialSortables.indexOf(source.sortable);
            const target = currentSortables[initialPosition];
            const targetElement = target?.element;

            if (!target || !targetElement || !sourceElement) {
              return;
            }

            reorder(sourceElement, target.index, targetElement, source.index);

            batch(() => {
              for (const sortableInstances of instances.values()) {
                const entries = Array.from(sortableInstances).values();

                for (const sortable of entries) {
                  sortable.index = sortable.initialIndex;
                  sortable.group = sortable.initialGroup;
                }
              }
            });
          }
        });
      }),
    ];

    this.destroy = () => {
      destroyed = true;
      for (const unsubscribeListener of unsubscribe) {
        unsubscribeListener();
      }
      suspensions.destroy();
    };
  }
}

function reorder(
  sourceElement: Element,
  sourceIndex: number,
  targetElement: Element,
  targetIndex: number
) {
  const position = targetIndex < sourceIndex ? 'afterend' : 'beforebegin';

  targetElement.insertAdjacentElement(position, sourceElement);
}

function sortByIndex(a: Sortable, b: Sortable) {
  return a.index - b.index;
}

function sortByInitialIndex(a: Sortable, b: Sortable) {
  return a.initialIndex - b.initialIndex;
}

function sort(instances: Set<Sortable>, sortFn = sortByIndex) {
  return Array.from(instances).sort(sortFn);
}
