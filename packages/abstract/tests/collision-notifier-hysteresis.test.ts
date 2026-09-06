import {describe, expect, it} from 'bun:test';
import {
  CollisionNotifier,
  CollisionPriority,
  CollisionType,
  DragDropManager,
  Draggable,
  Droppable,
} from '@dnd-kit/abstract';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {Rectangle} from '@dnd-kit/geometry';

/** Flush microtasks so async drop target updates complete */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

/**
 * Creates a drag and drop manager with droppables whose collisions are fully
 * scripted: the current "winners" list dictates which droppables collide and
 * in which order. This makes it possible to simulate collision outcomes
 * flipping due to layout shifts caused by setting a drop target, without
 * having to simulate actual geometry.
 */
function createTestSetup(ids: UniqueIdentifier[]) {
  const manager = new DragDropManager();
  let winners: UniqueIdentifier[] = [];
  let shapeSize = 10;

  /** Every drop target transition, in order */
  const targetHistory: (UniqueIdentifier | null)[] = [];

  manager.monitor.addEventListener('dragover', (event) => {
    targetHistory.push(event.operation.target?.id ?? null);
  });

  const draggable = new Draggable(
    {id: 'drag-source', register: false},
    manager
  );
  draggable.register();

  const droppables = ids.map((id) => {
    const droppable = new Droppable(
      {
        id,
        register: false,
        collisionDetector: ({droppable}) => {
          const index = winners.indexOf(droppable.id);

          if (index === -1) return null;

          return {
            id: droppable.id,
            value: winners.length - index,
            type: CollisionType.ShapeIntersection,
            priority: CollisionPriority.Normal,
          };
        },
      },
      manager
    );
    droppable.shape = new Rectangle(0, 0, 100, 100);
    droppable.register();

    return droppable;
  });

  return {
    manager,
    targetHistory,
    setWinners(next: UniqueIdentifier[]) {
      winners = next;
    },
    async start(coordinates = {x: 50, y: 50}) {
      manager.actions.start({source: draggable, coordinates});
      await flush();
      manager.dragOperation.shape = new Rectangle(
        coordinates.x,
        coordinates.y,
        10,
        10
      );
      await flush();
    },
    async stop() {
      manager.actions.stop();
      await flush();
    },
    /**
     * Moves the pointer and updates the drag shape, mirroring how the
     * feedback plugin updates the drag shape as the pointer moves. The shape
     * update is what triggers collision recomputation.
     */
    async moveTo(x: number, y: number) {
      manager.dragOperation.position.current = {x, y};
      shapeSize = shapeSize === 10 ? 11 : 10;
      manager.dragOperation.shape = new Rectangle(x, y, shapeSize, 10);
      await flush();
    },
    target() {
      return manager.dragOperation.target?.id ?? null;
    },
    destroy() {
      draggable.destroy();
      droppables.forEach((droppable) => droppable.destroy());
      manager.destroy();
    },
  };
}

describe('CollisionNotifier hysteresis', () => {
  it('does not oscillate between two droppables when layout shifts flip the winning collision', async () => {
    const setup = createTestSetup(['A', 'B']);
    const {setWinners, start, moveTo, target, targetHistory} = setup;

    await start();

    setWinners(['B']);
    await moveTo(51, 50);
    expect(target()).toBe('B');

    // Simulate a layout shift in response to targeting B: at nearly the same
    // pointer position, A now wins. A was never a recent target, so the
    // switch is honored.
    setWinners(['A']);
    await moveTo(52, 50);
    expect(target()).toBe('A');

    // The layout shifts back in response to targeting A: B wins again. This
    // is the oscillation cycle — B was targeted moments ago at nearly the
    // same coordinates, so re-targeting it is suppressed.
    setWinners(['B']);
    await moveTo(53, 50);
    expect(target()).toBe('A');

    // Micro pointer movements keep the cycle suppressed.
    await moveTo(54, 50);
    expect(target()).toBe('A');
    await moveTo(53, 51);
    expect(target()).toBe('A');

    // No intermediate flip-flopping happened.
    expect(targetHistory).toEqual(['B', 'A']);

    // Deliberate pointer travel beyond the hysteresis threshold re-allows
    // targeting B.
    await moveTo(75, 50);
    expect(target()).toBe('B');
    expect(targetHistory).toEqual(['B', 'A', 'B']);

    setup.destroy();
  });

  it('never suppresses clearing the drop target', async () => {
    const setup = createTestSetup(['A']);
    const {setWinners, start, moveTo, target, targetHistory} = setup;

    await start();

    setWinners(['A']);
    await moveTo(51, 50);
    expect(target()).toBe('A');

    // No more collisions: the target is cleared immediately, even though the
    // pointer has barely moved.
    setWinners([]);
    await moveTo(52, 50);
    expect(target()).toBe(null);

    // A becoming the winner again right away is treated as jitter and
    // suppressed until the pointer travels.
    setWinners(['A']);
    await moveTo(53, 50);
    expect(target()).toBe(null);

    await moveTo(70, 50);
    expect(target()).toBe('A');

    expect(targetHistory).toEqual(['A', null, 'A']);

    setup.destroy();
  });

  it('locks oscillation cycles even when an external plugin re-targets the source between switches', async () => {
    // Mimics OptimisticSortingPlugin: after a cross-container reorder it sets
    // the drop target back to the source, so the oscillation manifests as the
    // winning collision alternating between two other droppables while the
    // current target remains the source.
    const setup = createTestSetup(['item-2', 'item-4', 'source-item']);
    const {manager, setWinners, start, moveTo, target, targetHistory} = setup;

    manager.monitor.addEventListener('dragover', (event) => {
      const targetId = event.operation.target?.id;

      if (targetId != null && targetId !== 'source-item') {
        queueMicrotask(() => {
          manager.actions.setDropTarget('source-item');
        });
      }
    });

    await start();

    setWinners(['item-2']);
    await moveTo(51, 50);
    expect(target()).toBe('source-item');

    setWinners(['item-4']);
    await moveTo(52, 50);
    expect(target()).toBe('source-item');

    // The cycle: item-2 wins again at nearly the same coordinates. It was
    // recently targeted, so the switch is suppressed and no reorder happens.
    setWinners(['item-2']);
    await moveTo(53, 50);
    expect(target()).toBe('source-item');

    setWinners(['item-4']);
    await moveTo(54, 50);
    expect(target()).toBe('source-item');

    // Each of item-2 and item-4 was targeted exactly once; the suppressed
    // attempts caused no dragover events.
    expect(targetHistory).toEqual([
      'item-2',
      'source-item',
      'item-4',
      'source-item',
    ]);

    // Deliberate travel re-allows targeting.
    setWinners(['item-4']);
    await moveTo(80, 50);
    expect(targetHistory).toEqual([
      'item-2',
      'source-item',
      'item-4',
      'source-item',
      'item-4',
      'source-item',
    ]);

    setup.destroy();
  });

  it('resets the recent target history between drag operations', async () => {
    const setup = createTestSetup(['A', 'B']);
    const {setWinners, start, stop, moveTo, target} = setup;

    await start();

    setWinners(['A']);
    await moveTo(51, 50);
    setWinners(['B']);
    await moveTo(52, 50);
    setWinners(['A']);
    await moveTo(53, 50);
    // A is suppressed within the same drag operation.
    expect(target()).toBe('B');

    await stop();
    await start({x: 53, y: 50});

    // A new drag operation starts with a clean slate: A can be targeted
    // immediately at the same coordinates.
    setWinners(['A']);
    await moveTo(54, 50);
    expect(target()).toBe('A');

    setup.destroy();
  });

  it('exposes a configurable hysteresis threshold', async () => {
    const previousThreshold = CollisionNotifier.hysteresis;
    CollisionNotifier.hysteresis = 40;

    try {
      const setup = createTestSetup(['A', 'B']);
      const {setWinners, start, moveTo, target} = setup;

      await start();

      setWinners(['B']);
      await moveTo(51, 50);
      setWinners(['A']);
      await moveTo(52, 50);
      expect(target()).toBe('A');

      // 23px of travel: below the configured threshold, still suppressed.
      setWinners(['B']);
      await moveTo(75, 50);
      expect(target()).toBe('A');

      // 43px of travel: beyond the configured threshold.
      await moveTo(95, 50);
      expect(target()).toBe('B');

      setup.destroy();
    } finally {
      CollisionNotifier.hysteresis = previousThreshold;
    }
  });
});
