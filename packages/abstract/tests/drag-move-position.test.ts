import {describe, expect, it} from 'bun:test';
import {DragDropManager, Draggable} from '@dnd-kit/abstract';
import type {Coordinates} from '@dnd-kit/geometry';

/** Flush microtasks so the queued position update is applied */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

async function startDrag() {
  const manager = new DragDropManager();
  const draggable = new Draggable({id: 'item', register: false}, manager);
  draggable.register();

  manager.actions.start({source: draggable, coordinates: {x: 50, y: 50}});
  await flush();

  return manager;
}

describe('dragmove position', () => {
  // https://github.com/clauderic/dnd-kit/issues/1991
  it('reports the position the move produces, not the previous one', async () => {
    const manager = await startDrag();
    const reported: number[] = [];
    const applied: number[] = [];

    manager.monitor.addEventListener('dragmove', (event) => {
      reported.push(event.operation.position.current.y);
    });

    // Up, Up, Down, Down, as with the keyboard sensor
    for (const y of [-10, -10, 10, 10]) {
      manager.actions.move({by: {x: 0, y}});
      await flush();
      applied.push(manager.dragOperation.position.current.y);
    }

    expect(applied).toEqual([40, 30, 40, 50]);
    expect(reported).toEqual(applied);
  });

  it('reports the previous position as `previous`', async () => {
    const manager = await startDrag();
    const reported: Array<{current: Coordinates; previous?: Coordinates}> = [];

    manager.monitor.addEventListener('dragmove', (event) => {
      const {current, previous} = event.operation.position;
      reported.push({
        current: {...current},
        previous: previous && {...previous},
      });
    });

    manager.actions.move({by: {x: 5, y: -10}});
    await flush();

    expect(reported).toEqual([
      {current: {x: 55, y: 40}, previous: {x: 50, y: 50}},
    ]);
  });

  it('reports absolute moves made with `to`', async () => {
    const manager = await startDrag();
    let reported: Coordinates | undefined;

    manager.monitor.addEventListener('dragmove', (event) => {
      reported = {...event.operation.position.current};
    });

    manager.actions.move({to: {x: 120, y: 80}});
    await flush();

    expect(reported).toEqual({x: 120, y: 80});
    expect(manager.dragOperation.position.current).toEqual({x: 120, y: 80});
  });

  it('does not apply the position when a listener prevents the move', async () => {
    const manager = await startDrag();

    manager.monitor.addEventListener('dragmove', (event) => {
      event.preventDefault();
    });

    manager.actions.move({by: {x: 0, y: 30}});
    await flush();

    expect(manager.dragOperation.position.current).toEqual({x: 50, y: 50});
  });
});
