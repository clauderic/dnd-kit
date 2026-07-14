import {describe, expect, it} from 'bun:test';

import {
  DragDropManager,
  Draggable,
  Modifier,
} from '../src/core/index.ts';

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function point(coordinates: {x: number; y: number}) {
  return {
    x: coordinates.x,
    y: coordinates.y,
  };
}

class ClampXModifier extends Modifier {
  public apply(operation: Parameters<Modifier['apply']>[0]) {
    return {x: 0, y: operation.transform.y};
  }
}

describe('Drag operation event snapshots', () => {
  it('should expose the current transform in dragmove and dragend events without visual feedback', async () => {
    const manager = new DragDropManager();
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    const transforms: Array<{event: string; transform: {x: number; y: number}}> =
      [];
    let dragMovePosition: {x: number; y: number} | undefined;

    draggable.register();

    manager.monitor.addEventListener('dragstart', (event) => {
      transforms.push({
        event: 'dragstart',
        transform: point(event.operation.transform),
      });
    });

    manager.monitor.addEventListener('dragmove', (event) => {
      transforms.push({
        event: 'dragmove',
        transform: point(event.operation.transform),
      });
      dragMovePosition = point(event.operation.position.current);
    });

    manager.monitor.addEventListener('dragend', (event) => {
      transforms.push({
        event: 'dragend',
        transform: point(event.operation.transform),
      });
    });

    manager.actions.start({source: draggable, coordinates: {x: 10, y: 20}});
    await flush();

    manager.actions.move({to: {x: 35, y: 65}});
    await flush();

    manager.actions.stop();
    await flush();

    expect(transforms).toEqual([
      {event: 'dragstart', transform: {x: 0, y: 0}},
      {event: 'dragmove', transform: {x: 25, y: 45}},
      {event: 'dragend', transform: {x: 25, y: 45}},
    ]);
    expect(dragMovePosition).toEqual({x: 35, y: 65});

    draggable.destroy();
    manager.destroy();
  });

  it('should expose modified transforms in dragmove and dragend events', async () => {
    const manager = new DragDropManager({modifiers: [ClampXModifier]});
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    const transforms: Array<{event: string; transform: {x: number; y: number}}> =
      [];

    draggable.register();

    manager.monitor.addEventListener('dragmove', (event) => {
      transforms.push({
        event: 'dragmove',
        transform: point(event.operation.transform),
      });
    });

    manager.monitor.addEventListener('dragend', (event) => {
      transforms.push({
        event: 'dragend',
        transform: point(event.operation.transform),
      });
    });

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    await flush();

    manager.actions.move({to: {x: 100, y: 50}});
    await flush();

    manager.actions.stop();
    await flush();

    expect(transforms).toEqual([
      {event: 'dragmove', transform: {x: 0, y: 50}},
      {event: 'dragend', transform: {x: 0, y: 50}},
    ]);

    draggable.destroy();
    manager.destroy();
  });

  it('should not commit a prevented dragmove transform to the operation state', async () => {
    const manager = new DragDropManager();
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    const transforms: Array<{event: string; transform: {x: number; y: number}}> =
      [];
    let committedPosition: {x: number; y: number} | undefined;

    draggable.register();

    manager.monitor.addEventListener('dragmove', (event) => {
      transforms.push({
        event: 'dragmove',
        transform: point(event.operation.transform),
      });

      if (event.to?.x === 20 && event.to.y === 20) {
        event.preventDefault();
      }
    });

    manager.monitor.addEventListener('dragend', (event) => {
      transforms.push({
        event: 'dragend',
        transform: point(event.operation.transform),
      });
      committedPosition = point(event.operation.position.current);
    });

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    await flush();

    manager.actions.move({to: {x: 10, y: 10}});
    await flush();

    manager.actions.move({to: {x: 20, y: 20}});
    await flush();

    manager.actions.stop();
    await flush();

    expect(transforms).toEqual([
      {event: 'dragmove', transform: {x: 10, y: 10}},
      {event: 'dragmove', transform: {x: 20, y: 20}},
      {event: 'dragend', transform: {x: 10, y: 10}},
    ]);
    expect(committedPosition).toEqual({x: 10, y: 10});

    draggable.destroy();
    manager.destroy();
  });

  it('should accumulate relative moves queued in the same tick', async () => {
    const manager = new DragDropManager();
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    let dragEndTransform: {x: number; y: number} | undefined;
    let committedPosition: {x: number; y: number} | undefined;

    draggable.register();

    manager.monitor.addEventListener('dragend', (event) => {
      dragEndTransform = point(event.operation.transform);
      committedPosition = point(event.operation.position.current);
    });

    manager.actions.start({source: draggable, coordinates: {x: 0, y: 0}});
    await flush();

    manager.actions.move({by: {x: 10, y: 0}});
    manager.actions.move({by: {x: 5, y: 0}});
    await flush();

    manager.actions.stop();
    await flush();

    expect(dragEndTransform).toEqual({x: 15, y: 0});
    expect(committedPosition).toEqual({x: 15, y: 0});

    draggable.destroy();
    manager.destroy();
  });
});
