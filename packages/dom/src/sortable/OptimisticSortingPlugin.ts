import {Plugin, type UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';
import {move} from '@dnd-kit/helpers';

import {isSortable} from './utilities.ts';
import {Sortable, SortableDroppable} from './sortable.ts';
import {batch} from '@dnd-kit/state';

const defaultGroup = '__default__';

export class OptimisticSortingPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const getSortableInstances = () => {
      const sortableInstances = new Map<
        UniqueIdentifier | undefined,
        Set<Sortable>
      >();

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

      for (const [group, instances] of sortableInstances) {
        sortableInstances.set(group, new Set(sort(instances)));
      }

      return sortableInstances;
    };

    const unsubscribe = [
      manager.monitor.addEventListener('dragover', (event, manager) => {
        queueMicrotask(() => {
          if (this.disabled || event.defaultPrevented) {
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
          const sameGroup = source.sortable.group === target.sortable.group;
          const sourceInstances = instances.get(source.sortable.group);
          const targetInstances = sameGroup
            ? sourceInstances
            : instances.get(target.sortable.group);

          if (!sourceInstances || !targetInstances) return;

          // Wait for the renderer to handle the event before attempting to optimistically update
          manager.renderer.rendering.then(() => {
            for (const [group, sortableInstances] of instances.entries()) {
              const entries = Array.from(sortableInstances).entries();

              for (const [index, sortable] of entries) {
                if (sortable.index !== index || sortable.group !== group) {
                  // At least one index or group was changed so we should abort optimistic updates
                  return;
                }
              }
            }

            const sourceElement = source.sortable.element;
            const targetElement = target.sortable.element;

            if (!targetElement || !sourceElement) {
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
            const newState = move(state, source, target);
            const sourceIndex = newState[targetGroup].indexOf(source.sortable);
            const targetIndex = newState[targetGroup].indexOf(target.sortable);

            reorder(sourceElement, sourceIndex, targetElement, targetIndex);

            manager.collisionObserver.disable();

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

            manager.actions
              .setDropTarget(source.id)
              .then(() => manager.collisionObserver.enable());
          });
        });
      }),
      manager.monitor.addEventListener('dragend', (event, manager) => {
        if (!event.canceled) {
          return;
        }

        const {dragOperation} = manager;
        const {source} = dragOperation;

        if (!isSortable(source)) {
          return;
        }

        if (
          source.sortable.initialIndex === source.sortable.index &&
          source.sortable.initialGroup === source.sortable.group
        ) {
          return;
        }

        queueMicrotask(() => {
          const instances = getSortableInstances();
          const initialGroupInstances = instances.get(
            source.sortable.initialGroup
          );

          if (!initialGroupInstances) return;

          // Wait for the renderer to handle the event before attempting to optimistically update
          manager.renderer.rendering.then(() => {
            for (const [group, sortableInstances] of instances.entries()) {
              const entries = Array.from(sortableInstances).entries();

              for (const [index, sortable] of entries) {
                if (sortable.index !== index || sortable.group !== group) {
                  // At least one index or group was changed so we should abort optimistic updates
                  return;
                }
              }
            }

            const initialGroup = sort(initialGroupInstances);
            const sourceElement = source.sortable.element;
            const targetElement =
              initialGroup[source.sortable.initialIndex]?.element;

            if (!targetElement || !sourceElement) {
              return;
            }

            reorder(
              sourceElement,
              source.sortable.initialIndex,
              targetElement,
              source.sortable.initialIndex
            );

            batch(() => {
              for (const [_, sortableInstances] of instances.entries()) {
                const entries = Array.from(sortableInstances).values();

                for (const sortable of entries) {
                  sortable.index = sortable.initialIndex;
                  sortable.group = sortable.initialGroup;
                }
              }
            });
          });
        });
      }),
    ];

    this.destroy = () => {
      for (const unsubscribeListener of unsubscribe) {
        unsubscribeListener();
      }
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

function sort(instances: Set<Sortable>) {
  return Array.from(instances).sort(sortByIndex);
}
