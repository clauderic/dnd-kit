import {expect, it} from 'bun:test';
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/abstract';
import type {DragDropManager as DOMDragDropManager} from '@dnd-kit/dom';
import {pointerIntersection} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';
import {createCollisionSuspension} from '../src/sortable/plugins/collisionSuspension.ts';

async function flush() {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}

it('a DOM placement lease joins the built abstract observer and terminal transaction', async () => {
  const manager = new DragDropManager();
  const suspensions = createCollisionSuspension(
    manager as unknown as DOMDragDropManager
  );
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
    const lease = suspensions.acquire()!;
    expect(lease.current).toBe(true);
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    await flush();
    expect(manager.collisionObserver.disabled).toBe(false);
    expect(manager.dragOperation.targetIdentifier).toBeNull();
    expect(ends).toEqual([]);

    // Only a still-owned continuation can finish already accepted input after
    // stop. An unrelated programmatic move cannot change the pending drop.
    manager.actions.move({to: {x: 0, y: 0}});
    lease.run(() => manager.actions.move({to: {x: 251, y: 50}}));
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 251, y: 50});

    lease.release();
    await flush();
    expect(ends).toEqual(['target']);
    expect(manager.dragOperation.status.idle).toBe(true);
  } finally {
    suspensions.destroy();
    manager.destroy();
    await flush();
  }
});
