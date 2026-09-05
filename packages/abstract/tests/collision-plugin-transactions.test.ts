import {afterEach, describe, expect, it} from 'bun:test';
import {
  DragDropManager,
  Draggable,
  Droppable,
  CollisionPlugin,
  CollisionType,
  CollisionPriority,
  type DragEndEvent,
} from '@dnd-kit/abstract';
import {Rectangle} from '@dnd-kit/geometry';

class PlacementPlugin extends CollisionPlugin {
  begin() {
    return this.beginCollisionTransaction();
  }
}

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
  return {manager, ends, start, plugin: new PlacementPlugin(manager)};
}

describe('Abstract plugin collision transactions', () => {
  it('remains removable through ordinary plugin configuration', async () => {
    const {manager} = await setup();
    manager.plugins = [PlacementPlugin];
    expect(manager.registry.plugins.get(PlacementPlugin)).toBeInstanceOf(
      PlacementPlugin
    );
    manager.plugins = [];
    expect(manager.registry.plugins.get(PlacementPlugin)).toBeUndefined();
  });

  it('keeps detection live and reconciles after every independent owner releases', async () => {
    const {manager, plugin} = await setup();
    const first = plugin.begin();
    const second = new PlacementPlugin(manager).begin();
    manager.actions.move({to: {x: 250, y: 50}});
    await flush();
    expect(manager.collisionObserver.computeCollisions()[0]?.id).toBe('B');
    expect(manager.dragOperation.targetIdentifier).toBe('A');
    expect(manager.collisionObserver.disabled).toBe(false);

    second.release();
    second.release();
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('A');
    manager.actions.move({to: {x: 450, y: 50}});
    await flush();
    first.release();
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('C');
  });

  it('finishes accepted input before drop without admitting unrelated movement', async () => {
    const {manager, plugin, ends} = await setup();
    const transaction = plugin.begin();
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    await flush();
    expect(ends).toHaveLength(0);
    transaction.run(() => manager.actions.move({to: {x: 450, y: 50}}));
    manager.actions.move({to: {x: 50, y: 50}});
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 450, y: 50});
    transaction.release();
    await flush();
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('C');
    expect(ends[0].operation.position.current).toEqual({x: 450, y: 50});
  });

  it('cancels immediately and makes old owners inert during a later drag', async () => {
    const {manager, plugin, start, ends} = await setup();
    const old = plugin.begin();
    manager.actions.stop({canceled: true});
    expect(ends).toHaveLength(1);
    expect(ends[0].canceled).toBe(true);
    await flush();
    await start();
    const current = plugin.begin();
    manager.actions.move({to: {x: 250, y: 50}});
    old.release();
    let continued = false;
    old.run(() => {
      continued = true;
    });
    await flush();
    expect(continued).toBe(false);
    expect(manager.dragOperation.targetIdentifier).toBe('A');
    current.release();
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('B');
  });

  it('unwinds a throwing continuation and makes released continuations inert', async () => {
    const {manager, plugin, ends} = await setup();
    const transaction = plugin.begin();
    manager.actions.move({to: {x: 250, y: 50}});
    manager.actions.stop();
    expect(() =>
      transaction.run(() => {
        throw new Error('continuation');
      })
    ).toThrow('continuation');
    manager.actions.move({to: {x: 450, y: 50}});
    await flush();
    expect(manager.dragOperation.position.current).toEqual({x: 250, y: 50});
    transaction.release();
    let continued = false;
    transaction.run(() => {
      continued = true;
    });
    await flush();
    expect(continued).toBe(false);
    expect(ends).toHaveLength(1);
    expect(ends[0].operation.target?.id).toBe('B');
  });

  it('preserves an external disable when work completes', async () => {
    const {manager, plugin} = await setup();
    const transaction = plugin.begin();
    manager.actions.move({to: {x: 250, y: 50}});
    manager.collisionObserver.disable();
    transaction.release();
    await flush();
    expect(manager.collisionObserver.disabled).toBe(true);
    expect(manager.dragOperation.targetIdentifier).toBe('A');
    manager.collisionObserver.enable();
    await flush();
    expect(manager.dragOperation.targetIdentifier).toBe('B');
  });

  it('does not suspend a different manager', async () => {
    const first = await setup();
    const second = await setup();
    const transaction = first.plugin.begin();
    first.manager.actions.move({to: {x: 250, y: 50}});
    second.manager.actions.move({to: {x: 250, y: 50}});
    second.manager.actions.stop();
    await flush();
    expect(first.manager.dragOperation.targetIdentifier).toBe('A');
    expect(second.ends).toHaveLength(1);
    expect(second.ends[0].operation.target?.id).toBe('B');
    transaction.release();
    await flush();
    expect(first.manager.dragOperation.targetIdentifier).toBe('B');
  });
});
