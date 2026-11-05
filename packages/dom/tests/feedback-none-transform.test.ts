import {describe, expect, it} from 'bun:test';

import {DragDropManager, Draggable} from '../../abstract/src/core/index.ts';
import {Feedback} from '../src/core/plugins/feedback/index.ts';

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function point(coordinates: {x: number; y: number}) {
  return {
    x: coordinates.x,
    y: coordinates.y,
  };
}

describe('Feedback none event snapshots', () => {
  it('should not disable operation transform updates', async () => {
    const manager = new DragDropManager({
      plugins: [Feedback.configure({feedback: 'none'})],
    });
    const draggable = new Draggable({id: 'd1', register: false}, manager);
    const transforms: Array<{event: string; transform: {x: number; y: number}}> =
      [];

    (draggable as unknown as {element: Element}).element = {} as Element;
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

    manager.actions.start({source: draggable, coordinates: {x: 5, y: 5}});
    await flush();

    manager.actions.move({to: {x: 20, y: 30}});
    await flush();

    manager.actions.stop();
    await flush();

    expect(transforms).toEqual([
      {event: 'dragmove', transform: {x: 15, y: 25}},
      {event: 'dragend', transform: {x: 15, y: 25}},
    ]);

    draggable.destroy();
    manager.destroy();
  });
});
