import {afterEach, describe, expect, it} from 'bun:test';
import {
  DragDropManager,
  Draggable,
  Droppable,
  type DragEndEvent,
} from '@dnd-kit/abstract';
import {pointerIntersection} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';

async function flush() {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}

const managers: DragDropManager<Draggable, Droppable>[] = [];
afterEach(async () => {
  for (const manager of managers.splice(0)) manager.destroy();
  await flush();
});

async function setup() {
  const manager = new DragDropManager();
  managers.push(manager);
  const source = new Draggable({id: 'source', register: false}, manager);
  source.register();
  for (const [index, id] of ['A', 'B', 'C'].entries()) {
    const target = new Droppable(
      {id, collisionDetector: pointerIntersection, register: false},
      manager
    );
    target.shape = new Rectangle(index * 200, 0, 100, 100);
    target.register();
  }
  const ends: DragEndEvent[] = [];
  manager.monitor.addEventListener('dragend', (event) => ends.push(event));
  manager.actions.start({source, coordinates: {x: 50, y: 50}});
  await flush();
  manager.dragOperation.shape = new Rectangle(45, 45, 10, 10);
  await flush();
  expect(manager.dragOperation.targetIdentifier).toBe('A');
  return {manager, ends};
}

describe('Collision delivery at drop', () => {
  it('consumes the last queued move before taking the dragend snapshot', async () => {
    const {manager, ends} = await setup();
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('B');
    expect(ends[0].operation.position.current).toEqual({x: 250, y: 50});
    expect(manager.dragOperation.status.idle).toBe(true);
  });

  it('waits for a pending placement and delivers the latest input before drop', async () => {
    const {manager, ends} = await setup();
    let release!: () => void;
    manager.renderer = {
      rendering: new Promise<void>((resolve) => {
        release = resolve;
      }),
    };
    manager.actions.move({to: {x: 250, y: 50}});
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('B');
    manager.actions.move({to: {x: 450, y: 50}});
    manager.actions.stop();
    await flush();
    expect(ends).toHaveLength(0);
    manager.actions.move({to: {x: 50, y: 50}});
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 450, y: 50});
    release();
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('C');
    expect(ends[0].operation.position.current).toEqual({x: 450, y: 50});
    expect(manager.dragOperation.status.idle).toBe(true);
  });

  it('cancel skips queued movement and does not wait for a renderer', async () => {
    const {manager, ends} = await setup();
    let release!: () => void;
    manager.renderer = {
      rendering: new Promise<void>((resolve) => {
        release = resolve;
      }),
    };
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop({canceled: true});
    expect(ends).toHaveLength(1);
    expect(ends[0].canceled).toBe(true);
    expect(ends[0].operation.target?.id).toBe('A');
    expect(ends[0].operation.position.current).toEqual({x: 50, y: 50});
    release();
    await flush();
    expect(manager.dragOperation.status.idle).toBe(true);
  });

  it('allows cancellation while a normal drop is waiting for its placement', async () => {
    const {manager, ends} = await setup();
    let release!: () => void;
    manager.renderer = {
      rendering: new Promise<void>((resolve) => {
        release = resolve;
      }),
    };
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    expect(ends).toHaveLength(0);
    manager.actions.stop({canceled: true});
    expect(ends).toHaveLength(1);
    expect(ends[0].canceled).toBe(true);
    release();
    await flush();
    expect(ends).toHaveLength(1);
  });

  it('retains collision prevention on the final input', async () => {
    const {manager, ends} = await setup();
    manager.monitor.addEventListener('collision', (event) =>
      event.preventDefault()
    );
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('A');
  });
});
