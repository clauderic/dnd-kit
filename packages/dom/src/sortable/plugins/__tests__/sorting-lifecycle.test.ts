import {afterEach, describe, expect, it} from 'bun:test';
import {effect} from '@dnd-kit/state';
import {Rectangle} from '@dnd-kit/geometry';

import {
  createSetup,
  deferred,
  ElementFixture,
  flush,
  preventable,
} from './fixtures.ts';
import {OptimisticSortingPlugin} from '../OptimisticSortingPlugin.ts';
import {SortableKeyboardPlugin} from '../SortableKeyboardPlugin.ts';

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

describe('optimistic sorting completion', () => {
  it('returns work covering source acknowledgment', async () => {
    const setup = createSetup();
    const plugin = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => plugin.destroy());
    const render = deferred();
    const acknowledgment = deferred();
    setup.fixture.renderer.rendering = render.promise;
    setup.fixture.monitor.addEventListener('dragover', (event) => {
      if (event.operation.target?.id === '0') {
        setup.fixture.renderer.rendering = acknowledgment.promise;
      }
    });

    const targeting = setup.manager.actions.setDropTarget('1');
    await flush();
    render.resolve();
    await flush();
    expect(setup.items.map(({index}) => index)).toEqual([1, 0, 2]);
    expect(setup.calls).toEqual(['1', '0']);
    expect(setup.fixture.pendingTargetRenders).toBeGreaterThan(0);
    acknowledgment.resolve();
    await targeting;
    await flush();
    expect(setup.fixture.collisionObserver.enable).not.toHaveBeenCalled();
  });

  it('releases a prevented dragover without reordering', async () => {
    const setup = createSetup();
    const plugin = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => plugin.destroy());
    setup.fixture.monitor.addEventListener('dragover', (event) =>
      event.preventDefault()
    );
    await setup.manager.actions.setDropTarget('1');
    await flush();
    expect(setup.items.map(({index}) => index)).toEqual([0, 1, 2]);
    expect(setup.calls).toEqual(['1']);
  });

  it('finishes placement before its action reports completion', async () => {
    const setup = createSetup();
    const plugin = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => plugin.destroy());
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    void setup.manager.actions.setDropTarget('1');
    await flush();
    const indicesAtIdle: number[] = [];
    setup.fixture.onRenderIdle = () => {
      // An earlier action can wake the stop loop just as its fallback starts
      // another action. The terminal check rechecks pending ownership first.
      if (!setup.fixture.pendingTargetRenders) {
        indicesAtIdle.push(setup.items[0].index);
      }
    };
    render.resolve();
    await flush();
    expect(setup.calls).toEqual(['1', '0']);
    expect(indicesAtIdle.length).toBeGreaterThan(0);
    expect(indicesAtIdle.every((index) => index === 1)).toBe(true);
  });

  it('releases when rendering rejects', async () => {
    const setup = createSetup();
    const plugin = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => plugin.destroy());
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    const targeting = setup.manager.actions
      .setDropTarget('1')
      .catch(() => false);
    await flush();
    render.reject(new Error('render failed'));
    await targeting;
    await flush();
    expect(setup.items[0].index).toBe(0);
  });

  it('finishes a controlled commit without applying the optimistic fallback', async () => {
    const setup = createSetup();
    const plugin = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => plugin.destroy());
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    void setup.manager.actions.setDropTarget('1');
    await flush();
    setup.items[0].index = 1;
    setup.items[1].index = 0;
    render.resolve();
    await flush();
    expect(setup.calls).toEqual(['1']);
  });

  for (const action of ['abort', 'replace', 'destroy'] as const) {
    it(`does not apply stale sorting after ${action}`, async () => {
      const setup = createSetup();
      const plugin = new OptimisticSortingPlugin(setup.manager);
      cleanup.push(() => plugin.destroy());
      const render = deferred();
      setup.fixture.renderer.rendering = render.promise;
      void setup.manager.actions.setDropTarget('1');
      await flush();
      if (action === 'abort') setup.operation.controller.abort();
      if (action === 'replace')
        setup.operation.controller = new AbortController();
      if (action === 'destroy') plugin.destroy();
      render.resolve();
      await flush();
      expect(setup.items.map(({index}) => index)).toEqual([0, 1, 2]);
      expect(setup.calls).toEqual(['1']);
    });
  }

  it('does not apply a cancellation rollback to a new controller', async () => {
    const setup = createSetup();
    const plugin = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => plugin.destroy());
    Object.defineProperty(setup.items[0], 'initialIndex', {value: 0});
    setup.items[0].index = 1;
    setup.items[1].index = 0;
    setup.operation.controller.abort();
    setup.operation.canceled = true;
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    setup.fixture.monitor.dispatch('dragend', preventable({canceled: true}));
    await flush();
    setup.operation.controller = new AbortController();
    setup.operation.canceled = false;
    render.resolve();
    await flush();
    expect(setup.items.map(({index}) => index)).toEqual([1, 0, 2]);
  });
});

function keyboardSetup(count = 3) {
  const setup = createSetup(count);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: setup.view,
  });
  cleanup.push(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const plugin = new SortableKeyboardPlugin(setup.manager);
  cleanup.push(() => plugin.destroy());
  return {...setup, plugin};
}

describe('keyboard sorting completion', () => {
  it('excludes its own header when the drag footprint is taller and the current target is elsewhere', async () => {
    const setup = keyboardSetup();
    setup.operation.target = null;
    setup.operation.shape.current = new Rectangle(0, 0, 100, 200);
    const sibling = setup.items[1].element as unknown as ElementFixture;
    sibling.rectangle = new Rectangle(0, -80, 100, 60);

    await setup.key({x: 0, y: -25}).finished;

    expect(setup.calls).toEqual(['1']);
  });

  for (const scenario of [
    'sibling',
    'no sibling',
    'higher priority',
  ] as const) {
    it(`prefers group peers while respecting ${scenario}`, async () => {
      const setup = keyboardSetup();
      setup.items[1].group = 'nested';
      if (scenario === 'no sibling') setup.items[2].disabled = true;
      if (scenario === 'higher priority') setup.items[1].collisionPriority = 5;
      const event = setup.key();
      await event.finished;
      expect(setup.calls[0]).toBe(scenario === 'sibling' ? '2' : '1');
    });
  }

  it('restores temporary shapes within the batch and releases when no target exists', async () => {
    const setup = keyboardSetup();
    const original = setup.items[1].droppable.shape!;
    const observations: unknown[] = [];
    cleanup.push(
      effect(() => {
        observations.push(setup.items[1].droppable.shape);
      })
    );
    setup.fixture.collisionObserver.computeCollisions.mockImplementation(() => {
      expect(setup.items[1].droppable.shape).not.toBe(original);
      return [];
    });
    const event = setup.key();
    await flush();
    expect(event.defaultPrevented).toBe(true);
    expect(setup.items[1].droppable.shape).toBe(original);
    expect(observations.every((shape) => shape === original)).toBe(true);
    expect(setup.calls).toEqual([]);
  });

  it('serializes accepted arrow presses through their optimistic commits', async () => {
    const setup = keyboardSetup();
    const optimistic = new OptimisticSortingPlugin(setup.manager);
    cleanup.push(() => optimistic.destroy());
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    const first = setup.key();
    const second = setup.key();
    await flush();
    expect(first.defaultPrevented).toBe(true);
    expect(second.defaultPrevented).toBe(false);
    expect(setup.calls).toEqual(['1']);
    render.resolve();
    await Promise.all([first.finished, second.finished]);
    expect(setup.calls).toEqual(['1', '0', '2', '0']);
    expect(setup.items[0].index).toBe(2);
    expect(setup.positions).toHaveLength(2);
    expect(setup.fixture.actions.move).not.toHaveBeenCalled();
  });

  it('releases when the target element disappears during rendering', async () => {
    const setup = keyboardSetup();
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    setup.key();
    await flush();
    setup.items[1].target = undefined;
    render.resolve();
    await flush();
    expect(setup.positions).toHaveLength(0);
  });

  it('discards queued commands and alignment from an aborted drag', async () => {
    const setup = keyboardSetup();
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    setup.key();
    setup.key();
    await flush();
    setup.operation.controller.abort();
    setup.operation.controller = new AbortController();
    setup.fixture.renderer.rendering = Promise.resolve();
    setup.operation.target = setup.items[0].droppable;
    render.resolve();
    await flush();
    expect(setup.calls).toEqual(['1']);
    expect(setup.positions).toHaveLength(0);
    setup.key();
    await flush();
    expect(setup.calls).toEqual(['1', '1']);
    expect(setup.positions).toHaveLength(1);
  });

  it('rejects a queued event belonging to a previous controller', async () => {
    const setup = keyboardSetup();
    setup.key();
    setup.operation.controller = new AbortController();
    await flush();
    expect(setup.calls).toEqual([]);
    expect(setup.positions).toHaveLength(0);
  });

  it('releases without alignment when target rendering rejects', async () => {
    const setup = keyboardSetup();
    const render = deferred();
    setup.fixture.renderer.rendering = render.promise;
    setup.key();
    await flush();
    render.reject(new Error('render failed'));
    await flush();
    expect(setup.positions).toHaveLength(0);
  });

  for (const change of ['source', 'disabled target', 'destroy'] as const) {
    it(`does not align a stale command after ${change} changes during rendering`, async () => {
      const setup = keyboardSetup();
      const render = deferred();
      setup.fixture.renderer.rendering = render.promise;
      setup.key();
      await flush();
      if (change === 'source')
        setup.operation.source = setup.items[2].draggable;
      if (change === 'disabled target')
        setup.items[1].droppable.disabled = true;
      if (change === 'destroy') setup.plugin.destroy();
      render.resolve();
      await flush();
      expect(setup.positions).toHaveLength(0);
    });
  }
});
