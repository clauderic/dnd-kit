import {afterEach, describe, expect, it} from 'bun:test';
import {DragDropManager, Draggable, Droppable} from '@dnd-kit/abstract';
import type {CollisionDetector, UniqueIdentifier} from '@dnd-kit/abstract';
import {
  defaultCollisionDetection,
  pointerIntersection,
} from '@dnd-kit/collision';
import {Rectangle} from '@dnd-kit/geometry';
import {batch, signal} from '@dnd-kit/state';

/**
 * Desired regressions for collision delivery, eligibility and target ownership.
 * These tests use the existing workspace builds, real rectangles and package
 * detectors. No build, timers, scripted winners or private collision state.
 * Source acknowledgment exercises the public action used by optimistic sorting;
 * the sorting plugin and browser layout are outside this abstract fixture.
 */

// Bounded microtasks drain the default renderer and action promise continuations.
// This is sufficient for these fixtures, not a general browser-render idle check.
async function flushMicrotasks() {
  for (let index = 0; index < 20; index++) {
    await Promise.resolve();
  }
}

const cleanups: (() => Promise<void>)[] = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) {
    await cleanup();
  }
});

function createSetup(
  entries: [UniqueIdentifier, Rectangle][] = [
    ['A', new Rectangle(0, 0, 100, 100)],
    ['B', new Rectangle(200, 0, 100, 100)],
  ],
  detector: CollisionDetector = defaultCollisionDetection
) {
  const manager = new DragDropManager();
  const renderer = manager.renderer;
  const targetHistory: (UniqueIdentifier | null)[] = [];
  let detectorCalls = 0;
  let collisionEvents = 0;

  manager.monitor.addEventListener('dragover', (event) => {
    targetHistory.push(event.operation.target?.id ?? null);
  });
  manager.monitor.addEventListener('collision', () => {
    collisionEvents++;
  });

  const source = new Draggable(
    {id: 'source', type: 'card', register: false},
    manager
  );
  source.register();

  const droppables = new Map<UniqueIdentifier, Droppable>();
  const addTarget = (id: UniqueIdentifier, shape: Rectangle) => {
    const droppable = new Droppable(
      {
        id,
        register: false,
        collisionDetector: (input) => {
          detectorCalls++;
          return detector(input);
        },
      },
      manager
    );
    droppable.shape = shape;
    droppable.register();
    droppables.set(id, droppable);
    return droppable;
  };
  for (const [id, shape] of entries) addTarget(id, shape);

  cleanups.push(async () => {
    manager.renderer = renderer;
    manager.actions.stop({canceled: true});
    await flushMicrotasks();
    source.destroy();
    for (const droppable of droppables.values()) droppable.destroy();
    manager.destroy();
    await flushMicrotasks();
  });

  return {
    manager,
    source,
    addTarget,
    droppables,
    targetHistory,
    target: () => manager.dragOperation.target?.id ?? null,
    published: () => manager.collisionObserver.collisions.map(({id}) => id),
    computed: () =>
      manager.collisionObserver.computeCollisions().map(({id}) => id),
    counts: () => ({detectorCalls, collisionEvents}),
    async start() {
      manager.actions.start({source, coordinates: {x: 50, y: 50}});
      await manager.renderer.rendering;
      await flushMicrotasks();
      manager.dragOperation.shape = new Rectangle(45, 45, 10, 10);
      await flushMicrotasks();
      expect(manager.dragOperation.status.dragging).toBe(true);
      expect(manager.collisionObserver.isDisabled()).toBe(false);
      return manager.dragOperation.controller!;
    },
    async moveTo(x: number, y: number, updateShape = true) {
      manager.actions.move({to: {x, y}});
      await flushMicrotasks();
      if (updateShape) {
        // Translate a constant-size drag shape, as visual feedback would.
        manager.dragOperation.shape = new Rectangle(x - 5, y - 5, 10, 10);
      }
      await flushMicrotasks();
    },
    async forceUpdate() {
      manager.collisionObserver.forceUpdate();
      await flushMicrotasks();
    },
  };
}

type Setup = ReturnType<typeof createSetup>;

function expectTarget(setup: Setup, id: UniqueIdentifier | null) {
  expect(setup.target()).toBe(id);
  // The getter alone hides a stale identifier after the target is unregistered.
  expect(setup.manager.dragOperation.targetIdentifier).toBe(id);
}

function holdRenderer(setup: Setup) {
  const {manager} = setup;
  const previous = manager.renderer;
  let release!: () => void;
  const rendering = new Promise<void>((resolve) => {
    release = resolve;
  });
  const renderer = {rendering};
  manager.renderer = renderer;
  const restore = () => {
    if (manager.renderer === renderer) manager.renderer = previous;
  };
  cleanups.push(async () => {
    restore();
    release();
    await flushMicrotasks();
  });
  return {
    rendering,
    restore,
    async release() {
      release();
      await rendering;
      await flushMicrotasks();
    },
  };
}

function overlappingSetup() {
  return createSetup(
    [
      ['A', new Rectangle(0, 0, 100, 100)],
      ['B', new Rectangle(0, 0, 200, 100)],
    ],
    pointerIntersection
  );
}

function threeTargetSetup() {
  return createSetup([
    ['A', new Rectangle(0, 0, 100, 100)],
    ['B', new Rectangle(200, 0, 100, 100)],
    ['C', new Rectangle(400, 0, 100, 100)],
  ]);
}

describe('Collision observer/notifier desired regressions', () => {
  it('moving both pointer and drag shape publishes and targets B', async () => {
    const setup = createSetup();
    await setup.start();
    expectTarget(setup, 'A');

    await setup.moveTo(250, 50);

    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);
  });

  for (const [name, detector] of [
    ['pointerIntersection', pointerIntersection],
    ['defaultCollisionDetection', defaultCollisionDetection],
  ] as const) {
    it(`position-only movement invalidates ${name} without a feedback shape write`, async () => {
      const setup = createSetup(undefined, detector);
      await setup.start();
      expectTarget(setup, 'A');
      const before = setup.counts();
      const shape = setup.manager.dragOperation.shape!.current;

      await setup.moveTo(250, 50, false);

      expect(setup.manager.dragOperation.position.current).toMatchObject({
        x: 250,
        y: 50,
      });
      expect(setup.manager.dragOperation.shape!.current).toBe(shape);
      expect(setup.counts().detectorCalls).toBeGreaterThan(
        before.detectorCalls
      );
      expect(setup.counts().collisionEvents).toBeGreaterThan(
        before.collisionEvents
      );
      expect(setup.published()[0]).toBe('B');
      expectTarget(setup, 'B');
      expect(setup.targetHistory).toEqual(['A', 'B']);
    });
  }

  it('stationary layout changes publish and apply the coherent new geometry', async () => {
    const setup = createSetup();
    await setup.start();
    expectTarget(setup, 'A');
    const before = setup.counts();
    const published: UniqueIdentifier[][] = [];
    setup.manager.monitor.addEventListener('collision', ({collisions}) => {
      published.push(collisions.map(({id}) => id));
    });

    batch(() => {
      setup.droppables.get('A')!.shape = new Rectangle(200, 0, 100, 100);
      setup.droppables.get('B')!.shape = new Rectangle(0, 0, 100, 100);
    });
    await flushMicrotasks();

    expect(setup.counts().detectorCalls).toBeGreaterThan(before.detectorCalls);
    expect(published).toEqual([['B']]);
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);
  });

  it('disabling the incumbent clears it even while a nonintersecting candidate remains', async () => {
    const setup = createSetup();
    await setup.start();
    setup.droppables.get('A')!.disabled = true;
    await flushMicrotasks();

    expect(setup.published()).toEqual([]);
    expectTarget(setup, null);
    expect(setup.targetHistory).toEqual(['A', null]);
  });

  it('disabling every candidate clears the target without movement', async () => {
    const setup = createSetup();
    await setup.start();
    batch(() => {
      for (const droppable of setup.droppables.values())
        droppable.disabled = true;
    });
    await flushMicrotasks();

    expect(setup.published()).toEqual([]);
    expectTarget(setup, null);
    expect(setup.targetHistory).toEqual(['A', null]);
  });

  it('public enable applies the latest result skipped during disable without another input', async () => {
    const setup = createSetup();
    await setup.start();
    setup.manager.collisionObserver.disable();
    const events = setup.counts().collisionEvents;

    await setup.moveTo(250, 50);
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'A');
    expect(setup.counts().collisionEvents).toBe(events);

    setup.manager.collisionObserver.enable();
    await flushMicrotasks();

    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);
  });

  it('settling a target render delivers the newer collision received during that render', async () => {
    const setup = threeTargetSetup();
    await setup.start();
    const gate = holdRenderer(setup);

    await setup.moveTo(250, 50);
    expectTarget(setup, 'B');
    // An internal render transaction must not claim the public disable flag.
    expect(setup.manager.collisionObserver.isDisabled()).toBe(false);
    await setup.moveTo(450, 50);
    expect(setup.published()).toEqual(['C']);
    expectTarget(setup, 'B');

    await gate.release();

    expect(setup.published()).toEqual(['C']);
    expectTarget(setup, 'C');
    expect(setup.targetHistory).toEqual(['A', 'B', 'C']);
  });

  it('forceUpdate(false) schedules a fresh pass without another reactive mutation', async () => {
    const setup = createSetup();
    await setup.start();
    // Rectangle fields are ordinary mutable numbers. This models a custom
    // measurement updated outside signals and explicitly invalidated by caller.
    (setup.droppables.get('A')!.shape as Rectangle).left = 200;
    (setup.droppables.get('B')!.shape as Rectangle).left = 0;
    await flushMicrotasks();
    expect(setup.computed()).toEqual(['B']);
    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'A');
    const before = setup.counts();

    setup.manager.collisionObserver.forceUpdate(false);
    expect(setup.counts()).toEqual(before);
    await flushMicrotasks();

    expect(setup.counts().detectorCalls).toBeGreaterThan(before.detectorCalls);
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'B');
  });

  it('a source acknowledgment survives same-input measurement and forced publication', async () => {
    const setup = createSetup([
      ['A', new Rectangle(0, 0, 100, 100)],
      ['source', new Rectangle(200, 0, 100, 100)],
    ]);
    await setup.start();
    await setup.manager.actions.setDropTarget('source');
    await flushMicrotasks();

    setup.droppables.get('A')!.shape = new Rectangle(-1, 0, 100, 100);
    await flushMicrotasks();
    await setup.forceUpdate();

    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'source');
    expect(setup.targetHistory).toEqual(['A', 'source']);
  });

  for (const updateShape of [false, true]) {
    it(`a new 1px reversal consumes an unchanged winner list after source acknowledgment (${updateShape ? 'with' : 'without'} feedback)`, async () => {
      const setup = createSetup([
        ['source', new Rectangle(0, 0, 100, 100)],
        ['A', new Rectangle(200, 0, 100, 100)],
      ]);
      await setup.start();
      await setup.moveTo(250, 50, updateShape);
      expectTarget(setup, 'A');
      await setup.manager.actions.setDropTarget('source');
      await flushMicrotasks();
      await setup.forceUpdate();
      expectTarget(setup, 'source');
      expect(setup.published()).toEqual(['A']);

      await setup.moveTo(249, 50, updateShape);

      expect(setup.published()).toEqual(['A']);
      expectTarget(setup, 'A');
      expect(setup.targetHistory).toEqual(['source', 'A', 'source', 'A']);
    });
  }

  it('an acknowledgment after already-processed same-winner input survives publication without further input', async () => {
    const setup = createSetup([
      ['source', new Rectangle(0, 0, 100, 100)],
      ['A', new Rectangle(200, 0, 100, 100)],
    ]);
    await setup.start();
    await setup.moveTo(250, 50, false);
    const before = setup.counts().collisionEvents;
    await setup.moveTo(251, 50, false);
    expect(setup.counts().collisionEvents).toBeGreaterThan(before);
    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'A');

    await setup.manager.actions.setDropTarget('source');
    await flushMicrotasks();
    expectTarget(setup, 'source');
    await setup.forceUpdate();

    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'source');
    expect(setup.targetHistory).toEqual(['source', 'A', 'source']);
  });

  it('temporarily measuring the acknowledged self-target preserves the original placement receipt', async () => {
    const setup = createSetup([
      ['source', new Rectangle(0, 0, 100, 100)],
      ['A', new Rectangle(200, 0, 100, 100)],
    ]);
    await setup.start();
    await setup.moveTo(250, 50, false);
    await setup.manager.actions.setDropTarget('source');
    await flushMicrotasks();

    batch(() => {
      setup.droppables.get('source')!.shape = new Rectangle(200, 0, 100, 100);
      setup.droppables.get('A')!.shape = new Rectangle(400, 0, 100, 100);
    });
    await flushMicrotasks();
    expect(setup.published()).toEqual(['source']);
    expectTarget(setup, 'source');

    batch(() => {
      setup.droppables.get('source')!.shape = new Rectangle(0, 0, 100, 100);
      setup.droppables.get('A')!.shape = new Rectangle(200, 0, 100, 100);
    });
    await flushMicrotasks();

    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'source');
    expect(setup.targetHistory).toEqual(['source', 'A', 'source']);
  });

  it('distinguishes [a, bc] from [ab, c] without requiring forceUpdate', async () => {
    const setup = createSetup(
      [
        ['a', new Rectangle(0, 0, 100, 100)],
        ['bc', new Rectangle(0, 0, 200, 100)],
        ['ab', new Rectangle(300, 0, 100, 100)],
        ['c', new Rectangle(300, 0, 200, 100)],
      ],
      pointerIntersection
    );
    await setup.start();
    expect(setup.published()).toEqual(['a', 'bc']);
    await setup.moveTo(350, 40);

    expect(setup.published()).toEqual(['ab', 'c']);
    expectTarget(setup, 'ab');
    expect(setup.targetHistory).toEqual(['a', 'ab']);
  });

  it('distinguishes numeric 1 from string "1"', async () => {
    const setup = createSetup([
      [1, new Rectangle(0, 0, 100, 100)],
      ['1', new Rectangle(200, 0, 100, 100)],
    ]);
    await setup.start();
    expectTarget(setup, 1);
    await setup.moveTo(250, 50);

    expect(setup.published()).toEqual(['1']);
    expectTarget(setup, '1');
    expect(setup.targetHistory).toEqual([1, '1']);
  });
});

// These invalidations need no new pointer input and no forceUpdate call.
describe('Registry and eligibility invalidation', () => {
  it('removing the selected target chooses the remaining collision, then clears its identifier when none remain', async () => {
    const setup = overlappingSetup();
    await setup.start();
    setup.droppables.get('A')!.unregister();
    await flushMicrotasks();
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'B');

    setup.droppables.get('B')!.unregister();
    await flushMicrotasks();
    expect(setup.published()).toEqual([]);
    expectTarget(setup, null);
    expect(setup.targetHistory).toEqual(['A', 'B', null]);
  });

  it('registering a closer collision changes the stationary target', async () => {
    const setup = createSetup(
      [['A', new Rectangle(0, 0, 200, 100)]],
      pointerIntersection
    );
    await setup.start();
    setup.addTarget('B', new Rectangle(0, 0, 100, 100));
    await flushMicrotasks();

    expect(setup.published()).toEqual(['B', 'A']);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);
  });

  it('priority changes reorder existing collisions immediately in both directions', async () => {
    const setup = overlappingSetup();
    await setup.start();
    const target = setup.droppables.get('B')!;
    target.collisionPriority = 100;
    await flushMicrotasks();
    expect(setup.published()).toEqual(['B', 'A']);
    expectTarget(setup, 'B');

    target.collisionPriority = undefined;
    await flushMicrotasks();
    expect(setup.published()).toEqual(['A', 'B']);
    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['A', 'B', 'A']);
  });

  it('replacing a detector can remove and restore a stationary collision', async () => {
    const setup = overlappingSetup();
    await setup.start();
    const target = setup.droppables.get('A')!;
    target.collisionDetector = () => null;
    await flushMicrotasks();
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'B');

    target.collisionDetector = pointerIntersection;
    await flushMicrotasks();
    expect(setup.published()).toEqual(['A', 'B']);
    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['A', 'B', 'A']);
  });

  it('replacing an accept rule removes and restores the incumbent', async () => {
    const setup = overlappingSetup();
    await setup.start();
    const target = setup.droppables.get('A')!;
    target.accept = () => false;
    await flushMicrotasks();
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'B');

    target.accept = ['card'];
    await flushMicrotasks();
    expect(setup.published()).toEqual(['A', 'B']);
    expectTarget(setup, 'A');
  });

  it('source type changes invalidate existing type-based accept rules', async () => {
    const setup = overlappingSetup();
    setup.droppables.get('A')!.accept = 'card';
    await setup.start();
    setup.source.type = 'container';
    await flushMicrotasks();
    expectTarget(setup, 'B');
    expect(setup.published()).toEqual(['B']);

    setup.source.type = 'card';
    await flushMicrotasks();
    expectTarget(setup, 'A');
    expect(setup.published()).toEqual(['A', 'B']);
  });

  it('tracks reactive dependencies read by an overridden accepts method', async () => {
    const setup = createSetup(
      [['B', new Rectangle(0, 0, 200, 100)]],
      pointerIntersection
    );
    const eligible = signal(true);
    class ConditionalDroppable extends Droppable {
      override accepts(source: Draggable) {
        return super.accepts(source) && eligible.value;
      }
    }
    const target = new ConditionalDroppable(
      {id: 'A', register: false, collisionDetector: pointerIntersection},
      setup.manager
    );
    target.shape = new Rectangle(0, 0, 100, 100);
    target.register();
    setup.droppables.set('A', target);
    await setup.start();
    expectTarget(setup, 'A');

    eligible.value = false;
    await flushMicrotasks();
    expectTarget(setup, 'B');
    expect(setup.published()).toEqual(['B']);

    eligible.value = true;
    await flushMicrotasks();
    expectTarget(setup, 'A');
    expect(setup.published()).toEqual(['A', 'B']);
  });

  for (const change of ['disable', 'reject', 'remove'] as const) {
    it(`an acknowledged self-target cannot remain selected after ${change}`, async () => {
      const setup = createSetup([
        ['A', new Rectangle(0, 0, 100, 100)],
        ['source', new Rectangle(200, 0, 100, 100)],
      ]);
      await setup.start();
      await setup.manager.actions.setDropTarget('source');
      await flushMicrotasks();
      const self = setup.droppables.get('source')!;
      if (change === 'disable') self.disabled = true;
      else if (change === 'reject') self.accept = () => false;
      else self.unregister();
      await flushMicrotasks();

      expect(setup.published()).toEqual(['A']);
      expectTarget(setup, 'A');
      expect(setup.targetHistory).toEqual(['A', 'source', 'A']);
    });
  }
});

describe('Reentrant collision listeners', () => {
  it('disable inside a listener suspends the decision and enable later replays it', async () => {
    const setup = createSetup();
    await setup.start();
    const {manager} = setup;
    const unsubscribe = manager.monitor.addEventListener(
      'collision',
      (event) => {
        if (event.collisions[0]?.id !== 'B') return;
        unsubscribe();
        manager.collisionObserver.disable();
      }
    );
    await setup.moveTo(250, 50, false);
    expect(manager.collisionObserver.isDisabled()).toBe(true);
    expect(setup.published()).toEqual(['B']);
    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['A']);

    manager.collisionObserver.enable();
    await flushMicrotasks();

    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);
  });

  it('stopping inside a listener prevents stale target application after dragend', async () => {
    const setup = createSetup();
    await setup.start();
    const ends: (UniqueIdentifier | null)[] = [];
    setup.manager.monitor.addEventListener('dragend', (event) => {
      ends.push(event.operation.target?.id ?? null);
    });
    setup.manager.monitor.addEventListener('collision', (event) => {
      if (event.collisions[0]?.id === 'B')
        setup.manager.actions.stop({canceled: true});
    });

    await setup.moveTo(250, 50, false);

    expect(ends).toEqual(['A']);
    expect(setup.manager.dragOperation.status.idle).toBe(true);
    expect(setup.published()).toEqual([]);
    expectTarget(setup, null);
    expect(setup.targetHistory).toEqual(['A']);
  });

  for (const target of ['C', 'source']) {
    it(`retargeting to ${target} inside a listener owns that pass; a new input can select B`, async () => {
      const setup = threeTargetSetup();
      if (target === 'source')
        setup.addTarget('source', new Rectangle(600, 0, 100, 100));
      await setup.start();
      const unsubscribe = setup.manager.monitor.addEventListener(
        'collision',
        (event) => {
          if (event.collisions[0]?.id !== 'B') return;
          unsubscribe();
          void setup.manager.actions.setDropTarget(target);
        }
      );

      await setup.moveTo(250, 50, false);
      expect(setup.published()).toEqual(['B']);
      expectTarget(setup, target);
      expect(setup.targetHistory).toEqual(['A', target]);

      await setup.moveTo(249, 50, false);
      expectTarget(setup, 'B');
      expect(setup.targetHistory).toEqual(['A', target, 'B']);
    });
  }

  it('invalidating the winner inside a listener recomputes before applying a target', async () => {
    const setup = createSetup();
    setup.addTarget('C', new Rectangle(200, 0, 200, 100));
    await setup.start();
    const unsubscribe = setup.manager.monitor.addEventListener(
      'collision',
      (event) => {
        if (event.collisions[0]?.id !== 'B') return;
        unsubscribe();
        setup.droppables.get('B')!.disabled = true;
      }
    );

    await setup.moveTo(250, 50, false);

    expect(setup.published()).toEqual(['C']);
    expectTarget(setup, 'C');
    expect(setup.targetHistory).toEqual(['A', 'C']);
  });

  it('preventing a collision event suppresses its default target but not later input', async () => {
    const setup = createSetup();
    await setup.start();
    const unsubscribe = setup.manager.monitor.addEventListener(
      'collision',
      (event) => {
        if (event.collisions[0]?.id !== 'B') return;
        unsubscribe();
        event.preventDefault();
      }
    );
    await setup.moveTo(250, 50, false);
    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['A']);

    await setup.moveTo(249, 50, false);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);
  });
});

describe('Pending rendering and drag generations', () => {
  it('a source acknowledgment during pending rendering cannot consume newer same-winner input', async () => {
    const setup = createSetup([
      ['source', new Rectangle(0, 0, 100, 100)],
      ['A', new Rectangle(200, 0, 100, 100)],
    ]);
    await setup.start();
    const gate = holdRenderer(setup);
    await setup.moveTo(250, 50, false);
    expectTarget(setup, 'A');
    const events = setup.counts().collisionEvents;

    await setup.moveTo(249, 50, false);
    expect(setup.published()).toEqual(['A']);
    expect(setup.counts().collisionEvents).toBe(events);
    const acknowledged = setup.manager.actions.setDropTarget('source');
    await flushMicrotasks();
    expectTarget(setup, 'source');
    expect(setup.targetHistory).toEqual(['source', 'A', 'source']);

    await gate.release();
    await acknowledged;

    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['source', 'A', 'source', 'A']);
  });

  it('an independent public disable survives target rendering and only explicit enable resumes delivery', async () => {
    const setup = threeTargetSetup();
    await setup.start();
    const gate = holdRenderer(setup);
    await setup.moveTo(250, 50);
    setup.manager.collisionObserver.disable();
    await setup.moveTo(450, 50);
    expect(setup.published()).toEqual(['C']);

    await gate.release();
    expect(setup.manager.collisionObserver.isDisabled()).toBe(true);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);

    setup.manager.collisionObserver.enable();
    await flushMicrotasks();
    expectTarget(setup, 'C');
    expect(setup.targetHistory).toEqual(['A', 'B', 'C']);
  });

  it('a pending renderer consumes only the latest input, without applying superseded targets', async () => {
    const setup = threeTargetSetup();
    await setup.start();
    const gate = holdRenderer(setup);
    await setup.moveTo(250, 50, false);
    await setup.moveTo(450, 50, false);
    await setup.moveTo(50, 50, false);
    expect(setup.published()).toEqual(['A']);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);

    await gate.release();

    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['A', 'B', 'A']);
  });

  it('enabling public observation cannot release an unresolved target render transaction', async () => {
    const setup = threeTargetSetup();
    await setup.start();
    const gate = holdRenderer(setup);
    await setup.moveTo(250, 50, false);
    setup.manager.collisionObserver.disable();
    await setup.moveTo(450, 50, false);
    setup.manager.collisionObserver.enable();
    await flushMicrotasks();
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['A', 'B']);

    await gate.release();
    expectTarget(setup, 'C');
    expect(setup.targetHistory).toEqual(['A', 'B', 'C']);
  });

  it('overlapping target writes wait for every outstanding render before reconciliation', async () => {
    const setup = threeTargetSetup();
    await setup.start();
    const first = holdRenderer(setup);
    const firstWrite = setup.manager.actions.setDropTarget('B');
    const second = holdRenderer(setup);
    const secondWrite = setup.manager.actions.setDropTarget('C');
    await setup.moveTo(49, 50, false);
    expect(setup.published()).toEqual(['A']);

    await second.release();
    await secondWrite;
    expectTarget(setup, 'C');
    expect(setup.targetHistory).toEqual(['A', 'B', 'C']);

    await first.release();
    await firstWrite;
    expectTarget(setup, 'A');
    expect(setup.targetHistory).toEqual(['A', 'B', 'C', 'A']);
  });

  it('a canceled drag ignores the later completion of its pending target render', async () => {
    const setup = threeTargetSetup();
    await setup.start();
    const gate = holdRenderer(setup);
    await setup.moveTo(250, 50, false);
    await setup.moveTo(450, 50, false);
    gate.restore();
    setup.manager.actions.stop({canceled: true});
    await flushMicrotasks();
    expect(setup.manager.dragOperation.status.idle).toBe(true);
    const before = setup.counts().collisionEvents;

    await gate.release();

    expect(setup.manager.dragOperation.status.idle).toBe(true);
    expect(setup.published()).toEqual([]);
    expectTarget(setup, null);
    expect(setup.targetHistory).toEqual(['A', 'B']);
    expect(setup.counts().collisionEvents).toBe(before);
  });

  it('a previous drag render cannot release the pending target transaction of a new drag', async () => {
    const setup = threeTargetSetup();
    const oldController = await setup.start();
    const oldGate = holdRenderer(setup);
    await setup.moveTo(250, 50, false);
    oldGate.restore();
    setup.manager.actions.stop({canceled: true});
    await flushMicrotasks();
    expect(oldController.signal.aborted).toBe(true);
    expect(setup.manager.dragOperation.status.idle).toBe(true);

    const currentController = await setup.start();
    const currentGate = holdRenderer(setup);
    await setup.moveTo(250, 50, false);
    await setup.moveTo(450, 50, false);
    expect(setup.published()).toEqual(['C']);
    expectTarget(setup, 'B');
    const before = [...setup.targetHistory];

    await oldGate.release();

    expect(setup.manager.dragOperation.controller).toBe(currentController);
    expect(currentController.signal.aborted).toBe(false);
    expect(setup.manager.dragOperation.status.dragging).toBe(true);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(before);

    await currentGate.release();
    expectTarget(setup, 'C');
    expect(setup.targetHistory).toEqual([...before, 'C']);
  });

  it('a canceled start render cannot start a newer drag that is still initializing', async () => {
    const setup = createSetup();
    const starts: UniqueIdentifier[] = [];
    setup.manager.monitor.addEventListener('dragstart', (event) => {
      starts.push(event.operation.source!.id);
    });
    const oldGate = holdRenderer(setup);
    const oldController = setup.manager.actions.start({
      source: setup.source,
      coordinates: {x: 50, y: 50},
    });
    oldGate.restore();
    setup.manager.actions.stop({canceled: true});
    await flushMicrotasks();
    expect(oldController.signal.aborted).toBe(true);
    expect(setup.manager.dragOperation.status.idle).toBe(true);

    const currentGate = holdRenderer(setup);
    const currentController = setup.manager.actions.start({
      source: setup.source,
      coordinates: {x: 250, y: 50},
    });
    setup.manager.dragOperation.shape = new Rectangle(245, 45, 10, 10);
    await flushMicrotasks();
    await oldGate.release();

    expect(setup.manager.dragOperation.controller).toBe(currentController);
    expect(setup.manager.dragOperation.status.initializing).toBe(true);
    expect(starts).toEqual([]);
    expect(setup.targetHistory).toEqual([]);

    await currentGate.release();

    expect(setup.manager.dragOperation.status.dragging).toBe(true);
    expect(starts).toEqual(['source']);
    expectTarget(setup, 'B');
    expect(setup.targetHistory).toEqual(['B']);
  });
});
