import {afterEach, describe, expect, it} from 'bun:test';
import {
  DragDropManager,
  Draggable,
  Droppable,
  CollisionType,
  CollisionPriority,
  type DragEndEvent,
} from '@dnd-kit/abstract';
import {Rectangle} from '@dnd-kit/geometry';

async function flush() {
  for (let index = 0; index < 40; index++) await Promise.resolve();
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
      {
        id,
        register: false,
        collisionDetector: ({droppable, dragOperation}) =>
          droppable.shape?.containsPoint(dragOperation.position.current)
            ? {
                id: droppable.id,
                value: 1,
                type: CollisionType.PointerIntersection,
                priority: CollisionPriority.Normal,
              }
            : null,
      },
      manager
    );
    target.shape = new Rectangle(index * 200, 0, 100, 100);
    target.register();
  }
  const ends: DragEndEvent[] = [];
  manager.monitor.addEventListener('dragend', (event) => ends.push(event));
  const start = async () => {
    manager.actions.start({source, coordinates: {x: 50, y: 50}});
    await flush();
    manager.dragOperation.shape = new Rectangle(45, 45, 10, 10);
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('A');
  };
  await start();
  return {manager, ends, start};
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  return {promise, resolve, reject};
}

describe('Action completion', () => {
  it('orders relative input handlers internally and drains accepted commands before drop', async () => {
    const {manager, ends} = await setup();
    const render = deferred();
    const positions: number[] = [];
    manager.monitor.addEventListener('dragmove', async (event) => {
      event.preventDefault();
      positions.push(manager.dragOperation.position.current.x);
      if (positions.length === 1) await render.promise;
      manager.dragOperation.position.current = {
        x: manager.dragOperation.position.current.x + 200,
        y: 50,
      };
    });
    manager.actions.move({by: {x: 200, y: 0}});
    manager.actions.move({by: {x: 200, y: 0}});
    manager.actions.stop();
    await flush();
    expect(positions).toEqual([50]);
    expect(ends).toHaveLength(0);
    render.resolve();
    await flush();
    expect(positions).toEqual([50, 250]);
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('C');
  });

  it('discards undispatched relative commands on cancellation', async () => {
    const {manager, start} = await setup();
    const render = deferred();
    let calls = 0;
    const unsubscribe = manager.monitor.addEventListener('dragmove', () => {
      calls++;
      return render.promise;
    });
    manager.actions.move({by: {x: 200, y: 0}});
    manager.actions.move({by: {x: 200, y: 0}});
    manager.actions.stop({canceled: true});
    unsubscribe();
    await flush();
    await start();
    render.resolve();
    await flush();
    expect(calls).toBe(1);
    expect(manager.dragOperation.position.current).toEqual({x: 50, y: 50});
  });

  it('keeps default motion immediate and never replays old input after asynchronous work', async () => {
    const {manager} = await setup();
    const work = deferred();
    manager.monitor.addEventListener('dragmove', () => work.promise);
    manager.actions.move({to: {x: 250, y: 50}});
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 250, y: 50});
    manager.actions.move({to: {x: 450, y: 50}});
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 450, y: 50});
    work.resolve();
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 450, y: 50});
    expect(manager.dragOperation.targetIdentifier).toBe('C');
  });

  it('preserves synchronous move errors without abandoning earlier returned work', async () => {
    const {manager, ends} = await setup();
    const work = deferred();
    manager.monitor.addEventListener('dragmove', () => work.promise);
    manager.monitor.addEventListener('dragmove', () => {
      throw new Error('move');
    });
    expect(() => manager.actions.move({to: {x: 250, y: 50}})).toThrow('move');
    manager.actions.stop();
    await flush();
    expect(ends).toHaveLength(0);
    work.resolve();
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.position.current).toEqual({x: 50, y: 50});
  });

  it('waits for every returned handler while retaining the latest pointer input', async () => {
    const {manager} = await setup();
    const first = deferred();
    const second = deferred();
    manager.monitor.addEventListener('dragover', (event) => {
      if (event.operation.target?.id === 'B') return first.promise;
    });
    manager.monitor.addEventListener('dragover', (event) => {
      if (event.operation.target?.id === 'B') return second.promise;
    });
    let finished = false;
    const action = manager.actions.setDropTarget('B').then(() => {
      finished = true;
    });
    manager.actions.move({to: {x: 450, y: 50}});
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 450, y: 50});
    expect(manager.collisionObserver.computeCollisions()[0]?.id).toBe('C');
    expect(manager.dragOperation.targetIdentifier).toBe('B');
    expect(manager.collisionObserver.disabled).toBe(false);
    first.resolve();
    await flush();
    expect(finished).toBe(false);
    expect(manager.dragOperation.targetIdentifier).toBe('B');
    second.resolve();
    await action;
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('C');
  });

  it('allows a handler to await its nested target action without waiting on itself', async () => {
    const {manager} = await setup();
    const child = deferred();
    const order: string[] = [];
    manager.monitor.addEventListener('dragover', async (event) => {
      if (event.operation.target?.id === 'B') {
        order.push('parent');
        await manager.actions.setDropTarget('C');
        order.push('parent finished');
      } else if (event.operation.target?.id === 'C') {
        order.push('child');
        await child.promise;
        order.push('child finished');
      }
    });
    const action = manager.actions.setDropTarget('B');
    await flush();
    expect(order).toEqual(['parent', 'child']);
    child.resolve();
    await action;
    expect(order).toEqual([
      'parent',
      'child',
      'child finished',
      'parent finished',
    ]);
  });

  it('does not attach a same-target acknowledgment to its own pending action', async () => {
    const {manager} = await setup();
    manager.monitor.addEventListener('dragover', async (event) => {
      await manager.actions.setDropTarget(event.operation.target?.id);
    });
    await manager.actions.setDropTarget('B');
    expect(manager.dragOperation.targetIdentifier).toBe('B');
  });

  it('finishes an accepted input handler before drop and rejects new movement', async () => {
    const {manager, ends} = await setup();
    const input = deferred();
    manager.monitor.addEventListener('dragmove', async (event) => {
      event.preventDefault();
      await input.promise;
      manager.dragOperation.position.current = {x: 450, y: 50};
    });
    manager.actions.move({by: {x: 10, y: 0}});
    manager.actions.stop();
    await flush();
    expect(ends).toHaveLength(0);
    manager.actions.move({to: {x: 250, y: 50}});
    input.resolve();
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.position.current).toEqual({x: 450, y: 50});
    expect(ends[0].operation.target?.id).toBe('C');
  });

  it('cancels immediately and ignores old default movement during a later drag', async () => {
    const {manager, ends, start} = await setup();
    const old = deferred();
    const unsubscribe = manager.monitor.addEventListener(
      'dragmove',
      () => old.promise
    );
    manager.actions.move({to: {x: 450, y: 50}});
    manager.actions.stop({canceled: true});
    expect(ends).toHaveLength(1);
    expect(ends[0].canceled).toBe(true);
    unsubscribe();
    await flush();
    await start();
    const current = deferred();
    manager.monitor.addEventListener('dragmove', () => current.promise);
    manager.actions.move({to: {x: 250, y: 50}});
    old.resolve();
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 250, y: 50});
    expect(manager.dragOperation.targetIdentifier).toBe('A');
    current.resolve();
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('B');
  });

  for (const synchronous of [false, true]) {
    it(`retains sibling work after a ${synchronous ? 'thrown' : 'rejected'} handler failure`, async () => {
      const {manager, ends} = await setup();
      const sibling = deferred();
      const failed = deferred();
      manager.monitor.addEventListener('dragover', () => sibling.promise);
      manager.monitor.addEventListener('dragover', () => {
        if (synchronous) throw new Error('handler');
        return failed.promise;
      });
      let error: unknown;
      const action = manager.actions.setDropTarget('B').catch((value) => {
        error = value;
      });
      manager.actions.stop();
      if (!synchronous) failed.reject(new Error('handler'));
      await flush();
      expect(error).toBeUndefined();
      expect(ends).toHaveLength(0);
      sibling.resolve();
      await action;
      await flush();
      expect(error).toEqual(new Error('handler'));
      expect(ends).toHaveLength(1);
    });
  }

  it('does not leave a failed asynchronous move pending', async () => {
    const {manager, ends} = await setup();
    const input = deferred();
    manager.monitor.addEventListener('dragmove', (event) => {
      event.preventDefault();
      return input.promise;
    });
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    input.reject(new Error('move'));
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('A');
    expect(ends[0].operation.position.current).toEqual({x: 50, y: 50});
  });

  it('finishes a render started by a failing handler before reporting its error', async () => {
    const {manager} = await setup();
    const handler = deferred();
    const render = deferred();
    manager.monitor.addEventListener('dragover', async () => {
      await handler.promise;
      manager.renderer = {rendering: render.promise};
      throw new Error('handler');
    });
    let finished = false;
    const action = manager.actions.setDropTarget('B').catch(() => {
      finished = true;
    });
    handler.resolve();
    await flush();
    expect(finished).toBe(false);
    render.resolve();
    await action;
    expect(finished).toBe(true);
  });

  it('preserves public disabling after handler completion', async () => {
    const {manager} = await setup();
    const placement = deferred();
    manager.monitor.addEventListener('dragover', (event) => {
      if (event.operation.target?.id === 'B') return placement.promise;
    });
    const action = manager.actions.setDropTarget('B');
    manager.actions.move({to: {x: 450, y: 50}});
    manager.collisionObserver.disable();
    placement.resolve();
    await action;
    await flush();
    expect(manager.collisionObserver.disabled).toBe(true);
    expect(manager.dragOperation.targetIdentifier).toBe('B');
    manager.collisionObserver.enable();
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('C');
  });

  it('does not wait for unrelated event dispatches or a different manager', async () => {
    const first = await setup();
    const second = await setup();
    const work = deferred();
    first.manager.monitor.addEventListener('dragover', () => work.promise);
    const action = first.manager.actions.setDropTarget('B');
    second.manager.monitor.addEventListener('dragstart', () => work.promise);
    second.manager.monitor.dispatch('dragstart', {
      cancelable: false,
      operation: second.manager.dragOperation.snapshot(),
    });
    second.manager.actions.move({to: {x: 250, y: 50}});
    second.manager.actions.stop();
    await flush();
    expect(second.ends).toHaveLength(1);
    expect(second.ends[0].operation.target?.id).toBe('B');
    work.resolve();
    await action;
  });
});
