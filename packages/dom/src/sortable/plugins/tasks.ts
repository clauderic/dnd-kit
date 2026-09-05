import type {UniqueIdentifier} from '@dnd-kit/abstract';
import type {DragDropManager, Droppable} from '@dnd-kit/dom';
import {batch, untracked} from '@dnd-kit/state';
import {createDragTasks, type DragTask} from '../../utilities/dragTasks.ts';

interface SortableTask extends DragTask {
  include(entries: Iterable<Droppable>): void;
}

/** Measure the old and new placement before its handler's promise settles. */
export function createSortableTasks(
  manager: DragDropManager,
  enabled?: () => boolean
) {
  const tasks = createDragTasks(manager, enabled);

  return {
    run(
      entries: Iterable<Droppable>,
      callback: (task: SortableTask) => Promise<void>
    ) {
      const affected = new Set<UniqueIdentifier>();
      const elements = new Set<Element>();
      const include = (entries: Iterable<Droppable>) => {
        for (const entry of entries) {
          affected.add(entry.id);
          if (entry.element) elements.add(entry.element);
        }
        const ancestors = new Set<Element>();
        for (const element of elements) {
          let ancestor: Element | null = element;
          while (ancestor && !ancestors.has(ancestor)) {
            ancestors.add(ancestor);
            ancestor = ancestor.parentElement;
          }
        }
        for (const entry of manager.registry.droppables) {
          if (entry.element && ancestors.has(entry.element))
            affected.add(entry.id);
        }
      };
      untracked(() => include(entries));
      return tasks.run(async (task) => {
        try {
          await callback({
            get current() {
              return task.current;
            },
            waitFor: task.waitFor,
            include,
          });
        } finally {
          if (task.current)
            untracked(() => {
              include(
                Array.from(manager.registry.droppables).filter((entry) =>
                  affected.has(entry.id)
                )
              );
              batch(() => {
                for (const id of affected)
                  manager.registry.droppables.get(id)?.refreshShape();
              });
            });
        }
      });
    },
    destroy: tasks.destroy,
  };
}
