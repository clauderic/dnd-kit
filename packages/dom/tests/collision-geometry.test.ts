import {afterEach, describe, expect, it} from 'bun:test';
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/abstract';
import {pointerIntersection} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';

import {DragDropManager as DOMManager} from '@dnd-kit/dom';
import type {CollisionGeometry} from '../src/core/plugins/collision/geometry.ts';

async function flush() {
  for (let index = 0; index < 60; index++) await Promise.resolve();
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
  const domManager = new DOMManager({plugins: [], sensors: []});
  const [notifier] = domManager.plugins;
  const geometry = domManager.plugins.find(
    (plugin) => 'wrapRenderer' in plugin
  )!;
  // Exercise the actual DOM renderer boundary and abstract actions. Scrolling
  // and stylesheet effects need a browser and are covered by the browser suite.
  for (const plugin of domManager.plugins) {
    if (plugin !== geometry && plugin !== notifier) plugin.destroy();
  }
  const manager = domManager as unknown as DragDropManager<
    Draggable,
    Droppable
  >;
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
  const plugin = geometry as unknown as CollisionGeometry;
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
    targets,
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
      manager.renderer = {rendering: rendering.promise};
      const action = manager.actions.setDropTarget(id);
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
    expect(new Set(test.measurements)).toEqual(new Set(['A', 'B', 'C']));
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
    expect(new Set(test.measurements)).toEqual(new Set(['A', 'B', 'C']));
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
    expect(new Set(test.measurements)).toEqual(new Set(['A', 'B', 'C']));
    expect(test.detectedLayouts.length).toBeGreaterThan(0);
    for (const layout of test.detectedLayouts) {
      expect(layout).toEqual([200, 400, 0]);
    }
    expect(test.collisions).toEqual([['C']]);
    expect(test.ends).toEqual([{target: 'C', canceled: false}]);
    expect(test.manager.dragOperation.status.idle).toBe(true);
  });

  it('waits for plain async placement handlers before measuring their final layout', async () => {
    const test = await setup();
    const placement = deferred();
    test.manager.monitor.addEventListener('dragover', async (event) => {
      if (event.operation.target?.id !== 'B') return;
      await placement.promise;
      // A custom DOM plugin or application can move siblings and ancestors
      // without knowing about collision measurement or a sortable task helper.
      test.commit([200, 0, 600]);
    });
    let complete = false;
    const action = test.manager.actions.setDropTarget('B').then(() => {
      complete = true;
      expect(
        test.targets.map((target) => target.shape!.boundingRectangle.left)
      ).toEqual([200, 0, 600]);
    });
    await flush();
    expect(complete).toBe(false);
    test.manager.actions.stop();
    expect(test.ends).toEqual([]);
    placement.resolve();
    await action;
    await flush();
    expect(test.ends).toEqual([{target: 'B', canceled: false}]);
  });

  it('measures layout written by a plain async move handler before delivering drop', async () => {
    const test = await setup();
    const movement = deferred();
    test.manager.monitor.addEventListener('dragmove', async (event) => {
      event.preventDefault();
      await movement.promise;
      test.commit([200, 0, 600]);
      test.manager.dragOperation.position.current = {x: 60, y: 50};
    });
    test.manager.monitor.addEventListener('dragend', () => {
      expect(
        test.targets.map((target) => target.shape!.boundingRectangle.left)
      ).toEqual([200, 0, 600]);
    });
    test.manager.actions.move({by: {x: 10, y: 0}});
    test.manager.actions.stop();
    await flush();
    expect(test.ends).toEqual([]);
    movement.resolve();
    await flush();
    expect(test.ends).toEqual([{target: 'B', canceled: false}]);
  });

  it('coalesces simultaneous render reads but remeasures after later layout writes', async () => {
    const test = await setup();
    await Promise.all([
      test.manager.renderer.rendering,
      test.manager.renderer.rendering,
      test.manager.renderer.rendering,
    ]);
    expect(test.measurements).toEqual(['A', 'B', 'C']);
    test.commit([0, 300, 600]);
    await test.manager.renderer.rendering;
    expect(test.measurements).toEqual(['A', 'B', 'C', 'A', 'B', 'C']);
    expect(
      test.targets.map((target) => target.shape!.boundingRectangle.left)
    ).toEqual([0, 300, 600]);
  });

  it('restores a renderer without stacking measurement or losing its pending render', async () => {
    const test = await setup();
    const rendering = deferred();
    test.manager.renderer = {rendering: rendering.promise};
    const saved = test.manager.renderer;
    test.manager.renderer = test.renderer;
    test.manager.renderer = saved;
    test.manager.renderer = test.manager.renderer;
    let complete = false;
    const work = test.manager.renderer.rendering.then(() => {
      complete = true;
    });
    await flush();
    expect(complete).toBe(false);
    expect(test.measurements).toEqual([]);
    rendering.resolve();
    await work;
    expect(test.measurements).toEqual(['A', 'B', 'C']);
  });

  it('a failed measurement rejects its render and does not poison the next read', async () => {
    const test = await setup();
    const target = test.targets[1] as Droppable & {refreshShape: () => unknown};
    const refresh = target.refreshShape;
    target.refreshShape = () => {
      throw new Error('Measurement failed');
    };
    await expect(test.manager.renderer.rendering).rejects.toThrow(
      'Measurement failed'
    );
    target.refreshShape = refresh;
    test.commit([0, 300, 600]);
    await test.manager.renderer.rendering;
    expect(
      test.targets.map((target) => target.shape!.boundingRectangle.left)
    ).toEqual([0, 300, 600]);
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

  it('destroy skips measurement while retaining the underlying renderer completion', async () => {
    const test = await setup();
    const rendering = await test.place('B');
    test.manager.actions.move({to: {x: 250, y: 50}});
    test.manager.actions.stop();
    await flush();
    expect(test.ends).toEqual([]);

    test.manager.renderer = test.renderer;
    test.plugin.destroy();
    await flush();
    expect(test.ends).toEqual([]);
    rendering.resolve();
    await rendering.action;
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
    expect(new Set(test.measurements)).toEqual(new Set(['A', 'B', 'C']));

    await test.start();
    expect(new Set(test.measurements)).toEqual(new Set(['A', 'B', 'C']));
    expect(test.manager.dragOperation.targetIdentifier).toBe('A');
    expect(test.manager.dragOperation.status.dragging).toBe(true);
  });
});
