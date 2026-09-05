import {expect, it} from 'bun:test';
import {DragDropManager, Draggable, Droppable, Plugin} from '@dnd-kit/abstract';
import type {DragDropManager as DOMDragDropManager} from '@dnd-kit/dom';
import {pointerIntersection} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';
import {createDragTasks} from '../src/utilities/dragTasks.ts';

async function flush() {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}

class PlacementPlugin extends Plugin<DOMDragDropManager> {
  readonly tasks = createDragTasks(this.manager);
  destroy() {
    this.tasks.destroy();
    super.destroy();
  }
}

it('returned plugin work joins abstract collision and drop delivery', async () => {
  const manager = new DragDropManager();
  const plugin = new PlacementPlugin(manager as unknown as DOMDragDropManager);
  const {tasks} = plugin;
  const source = new Draggable({id: 'source', register: false}, manager);
  source.register();
  const droppable = new Droppable(
    {id: 'target', register: false, collisionDetector: pointerIntersection},
    manager
  );
  droppable.shape = new Rectangle(200, 0, 100, 100);
  droppable.register();
  const ends: unknown[] = [];
  manager.monitor.addEventListener('dragend', (event) =>
    ends.push(event.operation.target?.id)
  );
  try {
    manager.actions.start({source, coordinates: {x: 50, y: 50}});
    await flush();
    manager.dragOperation.shape = new Rectangle(45, 45, 10, 10);
    await flush();
    let release!: () => void;
    const work = new Promise<void>((resolve) => {
      release = resolve;
    });
    manager.monitor.addEventListener('dragmove', (event) =>
      tasks.run(async (task) => {
        event.preventDefault();
        if (!(await task.waitFor(work))) return;
        manager.dragOperation.position.current = {x: 251, y: 50};
      })
    );
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    await flush();
    expect(manager.collisionObserver.disabled).toBe(false);
    expect(manager.dragOperation.targetIdentifier).toBeNull();
    expect(ends).toEqual([]);
    manager.actions.move({to: {x: 0, y: 0}});
    release();
    await flush();
    expect(ends).toEqual(['target']);
    expect(manager.dragOperation.status.idle).toBe(true);
  } finally {
    plugin.destroy();
    manager.destroy();
    await flush();
  }
});
