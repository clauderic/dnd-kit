import {describe, expect, it} from 'bun:test';

import {DragDropManager} from '@dnd-kit/abstract';
import {Sortable} from '@dnd-kit/dom/sortable';

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function createSortable(manager: DragDropManager<any, any>, group?: string) {
  const sortable = new Sortable(
    {id: 's1', index: 0, group, plugins: [], transition: null},
    manager as any
  );
  sortable.register();

  return sortable;
}

async function drag(manager: DragDropManager<any, any>, sortable: Sortable) {
  manager.actions.start({
    source: sortable.draggable,
    coordinates: {x: 0, y: 0},
  });
  await flush();
}

async function drop(manager: DragDropManager<any, any>) {
  manager.actions.stop();
  await flush();
}

describe('Sortable initialIndex and initialGroup', () => {
  it('reports the current index in beforedragstart after the item has moved', async () => {
    const manager = new DragDropManager();
    const sortable = createSortable(manager);
    const initialIndices: number[] = [];

    manager.monitor.addEventListener('beforedragstart', () => {
      initialIndices.push(sortable.initialIndex);
    });

    await drag(manager, sortable);
    sortable.index = 2;
    await drop(manager);

    await drag(manager, sortable);
    await drop(manager);

    expect(initialIndices).toEqual([0, 2]);

    sortable.destroy();
    manager.destroy();
  });

  it('keeps the initial index for dragend while the item is being moved', async () => {
    const manager = new DragDropManager();
    const sortable = createSortable(manager);
    let initialIndexAtDragEnd: number | undefined;

    manager.monitor.addEventListener('dragend', () => {
      initialIndexAtDragEnd = sortable.initialIndex;
    });

    await drag(manager, sortable);
    sortable.index = 2;
    await drop(manager);

    expect(initialIndexAtDragEnd).toBe(0);

    sortable.destroy();
    manager.destroy();
  });

  it('reports the current index in beforedragstart after a suspended drag is aborted', async () => {
    const manager = new DragDropManager();
    const sortable = createSortable(manager);
    const initialIndices: number[] = [];

    manager.monitor.addEventListener('beforedragstart', () => {
      initialIndices.push(sortable.initialIndex);
    });
    manager.monitor.addEventListener('dragend', (event) => {
      const {abort} = event.suspend();
      setTimeout(abort, 0);
    });

    await drag(manager, sortable);
    sortable.index = 2;
    await drop(manager);

    await drag(manager, sortable);
    await drop(manager);

    expect(initialIndices).toEqual([0, 2]);

    sortable.destroy();
    manager.destroy();
  });

  it('reports the current group in beforedragstart after the item has changed groups', async () => {
    const manager = new DragDropManager();
    const sortable = createSortable(manager, 'a');
    const initialGroups: unknown[] = [];

    manager.monitor.addEventListener('beforedragstart', () => {
      initialGroups.push(sortable.initialGroup);
    });

    await drag(manager, sortable);
    sortable.group = 'b';
    await drop(manager);

    await drag(manager, sortable);
    await drop(manager);

    expect(initialGroups).toEqual(['a', 'b']);

    sortable.destroy();
    manager.destroy();
  });
});
