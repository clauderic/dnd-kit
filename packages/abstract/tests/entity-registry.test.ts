import {describe, expect, it} from 'bun:test';
import {effect} from '@dnd-kit/state';
import {DragDropManager, Draggable} from '@dnd-kit/abstract';

function createDraggables(manager: DragDropManager, count: number) {
  return Array.from(
    {length: count},
    (_, index) => new Draggable({id: `item-${index}`, register: false}, manager)
  );
}

function cpuTimeToMountAndUnmount(count: number) {
  const manager = new DragDropManager();
  const registry = manager.registry.draggables;
  const draggables = createDraggables(manager, count);
  const start = process.cpuUsage();

  for (const draggable of draggables)
    registry.register(draggable.id, draggable);
  for (const draggable of draggables)
    registry.unregister(draggable.id, draggable);

  const {user, system} = process.cpuUsage(start);
  manager.destroy();

  return user + system;
}

function fastest(count: number) {
  return Math.min(
    ...Array.from({length: 7}, () => cpuTimeToMountAndUnmount(count))
  );
}

describe('EntityRegistry', () => {
  it('registers and unregisters entities in time linear in their number', () => {
    fastest(1000);

    const ratio = fastest(8000) / fastest(1000);

    expect(ratio).toBeLessThan(24);
  });

  it('notifies readers when entities are registered and unregistered', () => {
    const manager = new DragDropManager();
    const registry = manager.registry.draggables;
    const [first, second] = createDraggables(manager, 2);
    const sizes: number[] = [];

    const dispose = effect(() => {
      sizes.push(Array.from(registry.value).length);
    });

    registry.register(first.id, first);
    registry.register(second.id, second);
    registry.unregister(first.id, first);

    expect(sizes).toEqual([0, 1, 2, 1]);
    expect(registry.has(first.id)).toBe(false);
    expect(registry.get(second.id)).toBe(second);

    dispose();
    manager.destroy();
  });

  it('removes the stale key when an entity is registered under a new id', () => {
    const manager = new DragDropManager();
    const registry = manager.registry.draggables;
    const [draggable] = createDraggables(manager, 1);

    registry.register('old', draggable);
    registry.register('new', draggable);

    expect(registry.has('old')).toBe(false);
    expect(registry.get('new')).toBe(draggable);
    expect(Array.from(registry)).toEqual([draggable]);

    manager.destroy();
  });
});
