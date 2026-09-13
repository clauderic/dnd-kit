import {expect, it} from 'bun:test';
import {
  DragDropManager,
  Draggable,
  Droppable,
  type CollisionDetector,
} from '@dnd-kit/abstract';
import {pointerIntersection} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';
import {batch} from '@dnd-kit/state';

async function flush() {
  for (let i = 0; i < 30; i++) await Promise.resolve();
}

it('coalesces input and geometry batches into one pass while preserving custom detector instances', async () => {
  const manager = new DragDropManager();
  const source = new Draggable({id: 'source', register: false}, manager);
  source.register();
  let calls = 0;
  let events = 0;
  const targets: Droppable[] = [];
  for (let index = 0; index < 20; index++) {
    const detector: CollisionDetector = (input) => {
      calls++;
      expect(Object.is(input.dragOperation, manager.dragOperation)).toBe(true);
      expect(Object.is(input.droppable, targets[index])).toBe(true);
      expect(input.dragOperation.shape!.current).toBe(shape);
      return pointerIntersection(input);
    };
    const target = new Droppable(
      {id: index, register: false, collisionDetector: detector},
      manager
    );
    target.shape = new Rectangle(index * 200, 0, 100, 100);
    target.register();
    targets.push(target);
  }
  const shape = new Rectangle(45, 45, 10, 10);
  manager.monitor.addEventListener('collision', () => events++);
  try {
    manager.actions.start({source, coordinates: {x: 50, y: 50}});
    await flush();
    manager.dragOperation.shape = shape;
    await flush();
    calls = events = 0;

    batch(() => {
      for (const target of targets)
        target.shape = (target.shape as Rectangle).translate(0, 1);
    });
    await flush();
    expect(calls).toBe(20);
    expect(events).toBe(1);

    calls = events = 0;
    // Independent synchronous measurement callbacks still produce one coherent
    // pass, rather than scanning all targets once per rectangle write.
    for (const target of targets)
      target.shape = (target.shape as Rectangle).translate(0, 1);
    await flush();
    expect(calls).toBe(20);
    expect(events).toBe(1);

    calls = events = 0;
    manager.actions.move({to: {x: 51, y: 50}});
    manager.actions.move({to: {x: 52, y: 50}});
    await flush();
    expect(calls).toBe(20);
    expect(events).toBe(1);

    calls = events = 0;
    for (let i = 0; i < 10; i++) manager.collisionObserver.forceUpdate(false);
    expect(calls).toBe(0);
    await flush();
    expect(calls).toBe(20);
    expect(events).toBe(1);
  } finally {
    manager.destroy();
    await flush();
  }
});
