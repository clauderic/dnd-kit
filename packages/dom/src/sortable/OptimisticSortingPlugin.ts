import {Plugin, UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';
import {arrayMove} from '@dnd-kit/helpers';

import {isSortable} from './utilities.js';
import {Sortable, SortableDroppable} from './sortable.js';
import {batch} from '@dnd-kit/state';

export class OptimisticSortingPlugin extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const getSortableInstances = (group: UniqueIdentifier | undefined) => {
      const sortableInstances = new Map<number, Sortable>();

      for (const droppable of manager.registry.droppables) {
        if (droppable instanceof SortableDroppable) {
          const {sortable} = droppable;

          if (sortable.group !== group) {
            continue;
          }

          if (sortableInstances.has(sortable.index)) {
            throw new Error(
              'Duplicate sortable index found for same sortable group. Make sure each sortable item has a unique index. Use the `group` attribute to separate sortables into different groups.'
            );
          }

          sortableInstances.set(sortable.index, sortable);
        }
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

          if (source.sortable.group !== target.sortable.group) {
            return;
          }

          const sortableInstances = getSortableInstances(source.sortable.group);

          // Wait for the renderer to handle the event before attempting to optimistically update
          manager.renderer.rendering.then(() => {
            for (const [index, sortable] of sortableInstances.entries()) {
              if (sortable.index !== index) {
                // At least one index was changed so we should abort optimistic updates
                return;
              }
            }

            const orderedSortables = Array.from(
              sortableInstances.values()
            ).sort((a, b) => a.index - b.index);

            const sourceIndex = orderedSortables.indexOf(source.sortable);
            const targetIndex = orderedSortables.indexOf(target.sortable);

            const newOrder = arrayMove(
              orderedSortables,
              sourceIndex,
              targetIndex
            );

            const sourceElement =
              source.sortable.droppable.internal.element.peek() ??
              source.sortable.droppable.placeholder;
            const targetElement = target.element;

            if (!targetElement || !sourceElement) {
              return;
            }

            reorder(sourceElement, sourceIndex, targetElement, targetIndex);

            batch(() => {
              for (const [index, sortable] of newOrder.entries()) {
                sortable.index = index;
              }
            });
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

        if (source.sortable.initialIndex === source.sortable.index) {
          return;
        }

        queueMicrotask(() => {
          const sortableInstances = getSortableInstances(source.sortable.group);

          // Wait for the renderer to handle the event before attempting to optimistically update
          manager.renderer.rendering.then(() => {
            for (const [index, sortable] of sortableInstances.entries()) {
              if (sortable.index !== index) {
                // At least one index was changed so we should abort optimistic updates
                return;
              }
            }

            const orderedSortables = Array.from(
              sortableInstances.values()
            ).sort((a, b) => a.index - b.index);

            const sourceElement = source.sortable.droppable.element;
            const targetElement =
              orderedSortables[source.sortable.initialIndex]?.element;

            if (!targetElement || !sourceElement) {
              return;
            }

            reorder(
              sourceElement,
              source.sortable.index,
              targetElement,
              source.sortable.initialIndex
            );

            batch(() => {
              for (const sortable of orderedSortables.values()) {
                sortable.index = sortable.initialIndex;
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
  const position = targetIndex < sourceIndex ? 'beforebegin' : 'afterend';

  targetElement.insertAdjacentElement(position, sourceElement);
}
