import {afterEach, describe, expect, it} from 'bun:test';
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/abstract';
import {pointerIntersection} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';

import type {DragDropManager as DOMManager} from '../src/core/manager/manager.ts';
import {CollisionGeometry} from '../src/core/plugins/collision/geometry.ts';

async function flush() {
  for (let index = 0; index < 20; index++) await Promise.resolve();
}

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  cleanups.push(async () => {
    resolve();
    await flush();
  });
  return {promise, resolve, reject};
}

async function setup() {
  const manager = new DragDropManager();
  const renderer = manager.renderer;
  const source = new Draggable({id: 'source', register: false}, manager);
  source.register();
  const ids = ['A', 'B', 'C'];
  const rectangles = ids.map(
    (_, index) => new Rectangle(index * 200, 0, 100, 100)
  );
  const measurements: string[] = [];
  const detectedLayouts: number[][] = [];
  const collisions: (string | number)[][] = [];
  const ends: {target: string | number | null; canceled: boolean}[] = [];
  const targets: Droppable[] = [];

  // The only simulated DOM work is the committed measurement. The manager,
  // entities, detectors and action completion are real.
  for (const [index, id] of ids.entries()) {
    const target = new Droppable(
      {
        id,
        register: false,
        collisionDetector: (input) => {
          detectedLayouts.push(
            targets.map((entry) => entry.shape!.boundingRectangle.left)
          );
          return pointerIntersection(input);
        },
      },
      manager
    );
    Object.assign(target, {
      element: {isConnected: true},
      refreshShape: () => {
        measurements.push(id);
        target.shape = rectangles[index];
        return target.shape;
      },
    });
    target.shape = rectangles[index];
    target.register();
    targets.push(target);
  }

  manager.monitor.addEventListener('collision', (event) => {
    collisions.push(event.collisions.map(({id}) => id));
  });
  manager.monitor.addEventListener('dragend', (event) => {
    ends.push({
      target: event.operation.target?.id ?? null,
      canceled: event.canceled,
    });
  });

  const start = async () => {
    manager.actions.start({source, coordinates: {x: 50, y: 50}});
    await flush();
    manager.dragOperation.shape = new Rectangle(45, 45, 10, 10);
    await flush();
    expect(manager.dragOperation.status.dragging).toBe(true);
  };
  await start();
  expect(manager.dragOperation.targetIdentifier).toBe('A');
  const domManager = manager as unknown as DOMManager;
  manager.plugins = [CollisionGeometry];
  const plugin = domManager.registry.plugins.get(CollisionGeometry)!;
  measurements.length = detectedLayouts.length = collisions.length = 0;

  cleanups.push(async () => {
    plugin.destroy();
    manager.renderer = renderer;
    manager.actions.stop({canceled: true});
    await flush();
    manager.destroy();
    await flush();
  });

  return {
    manager,
    plugin,
    renderer,
    start,
    measurements,
    detectedLayouts,
    collisions,
    ends,
    commit(lefts: number[]) {
      lefts.forEach((left, index) => {
        rectangles[index] = new Rectangle(left, 0, 100, 100);
      });
    },
    async place(id: string) {
      const rendering = deferred();
      manager.renderer = renderer;
      const action = manager.actions.setDropTarget(id);
      // The action already captured its resolved renderer. The geometry job
      // reads the controlled commit after dispatch, in its queued continuation.
      manager.renderer = {rendering: rendering.promise};
      action.catch(() => {});
      await flush();
      return {...rendering, action};
    },
  };
}

describe('Controlled collision geometry commits', () => {
  it('retains required measurements when application plugins are replaced', async () => {
    const test = await setup();
    test.manager.plugins = [];
    const rendering = await test.place('B');
    test.commit([200, 0, 400]);
    rendering.resolve();
    await flush();
    expect(test.measurements).toEqual(['A', 'B', 'C']);
    expect(test.manager.dragOperation.targetIdentifier).toBe('B');
  });

  it('remeasures a newer placement after the old pending commit and publishes only coherent final geometry', async () => {
    const test = await setup();
    const first = await test.place('B');
    const second = await test.place('C');
    test.manager.actions.stop();
    await flush();
    expect(test.measurements).toEqual([]);
    expect(test.ends).toEqual([]);

    test.commit([200, 0, 400]);
    first.resolve();
    await flush();
    expect(test.measurements).toEqual(['A', 'B', 'C']);
    expect(test.detectedLayouts.length).toBeGreaterThan(0);
    for (const layout of test.detectedLayouts) {
      expect(layout).toEqual([200, 0, 400]);
    }
    expect(test.collisions).toEqual([]);
    expect(test.ends).toEqual([]);

    test.detectedLayouts.length = 0;
    test.commit([200, 400, 0]);
    second.resolve();
    await flush();
    expect(test.measurements).toEqual(['A', 'B', 'C', 'A', 'B', 'C']);
    expect(test.detectedLayouts.length).toBeGreaterThan(0);
    for (const layout of test.detectedLayouts) {
      expect(layout).toEqual([200, 400, 0]);
    }
    expect(test.collisions).toEqual([['C']]);
    expect(test.ends).toEqual([{target: 'C', canceled: false}]);
    expect(test.manager.dragOperation.status.idle).toBe(true);
  });

  it('cancellation ends a drop waiting for geometry and makes the late commit inert', async () => {
    const test = await setup();
    const rendering = await test.place('B');
    test.manager.actions.stop();
    await flush();
    expect(test.ends).toEqual([]);

    test.manager.renderer = test.renderer;
    test.manager.actions.stop({canceled: true});
    await flush();
    expect(test.ends).toEqual([{target: 'B', canceled: true}]);
    expect(test.manager.dragOperation.status.idle).toBe(true);

    await test.start();
    expect(test.manager.dragOperation.targetIdentifier).toBe('A');
    const before = [...test.measurements];
    rendering.resolve();
    await flush();
    expect(test.measurements).toEqual(before);
    expect(test.manager.dragOperation.status.dragging).toBe(true);
    expect(test.manager.dragOperation.targetIdentifier).toBe('A');
    expect(test.ends).toHaveLength(1);
  });

  it('destroy finishes returned measurement work so a pending drop can complete', async () => {
    const test = await setup();
    const rendering = await test.place('B');
    test.manager.actions.move({to: {x: 250, y: 50}});
    test.manager.actions.stop();
    await flush();
    expect(test.ends).toEqual([]);

    test.manager.renderer = test.renderer;
    test.plugin.destroy();
    await flush();
    expect(test.ends).toEqual([{target: 'B', canceled: false}]);
    expect(test.manager.dragOperation.status.idle).toBe(true);
    expect(test.measurements).toEqual([]);

    rendering.resolve();
    await flush();
    expect(test.measurements).toEqual([]);
    expect(test.ends).toHaveLength(1);
  });

  it('a rejected geometry renderer releases drop delivery and allows the next drag to measure', async () => {
    const test = await setup();
    const rendering = await test.place('B');
    test.manager.actions.move({to: {x: 250, y: 50}});
    test.manager.actions.stop();
    await flush();
    expect(test.ends).toEqual([]);

    test.manager.renderer = test.renderer;
    rendering.reject(new Error('Controlled commit failed'));
    await flush();
    expect(test.ends).toEqual([{target: 'B', canceled: false}]);
    expect(test.manager.dragOperation.status.idle).toBe(true);
    expect(test.measurements).toEqual([]);

    await test.start();
    expect(test.measurements).toEqual(['A', 'B', 'C']);
    expect(test.manager.dragOperation.targetIdentifier).toBe('A');
    expect(test.manager.dragOperation.status.dragging).toBe(true);
  });
});
