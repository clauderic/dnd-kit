import {afterEach, describe, expect, it} from 'bun:test';
import {DragDropManager, Draggable} from '@dnd-kit/abstract';
import {createDragTasks} from '../src/utilities/dragTasks.ts';

async function flush() {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((a, b) => {
    resolve = a;
    reject = b;
  });
  return {promise, resolve, reject};
}
const cleanups: (() => void)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
  await flush();
});
async function setup() {
  const manager = new DragDropManager();
  const source = new Draggable({id: 'source', register: false}, manager);
  source.register();
  manager.actions.start({source, coordinates: {x: 0, y: 0}});
  cleanups.push(() => manager.destroy());
  await flush();
  return manager;
}

describe('Drag handler lifetime', () => {
  it('destroying one owner finishes only its work and invalidates continuations', async () => {
    const manager = await setup();
    const first = createDragTasks(manager);
    const second = createDragTasks(manager);
    cleanups.push(first.destroy, second.destroy);
    const render = deferred();
    let continued = 0;
    let secondFinished = false;
    const callback = async (task: {
      waitFor(work: Promise<void>): Promise<boolean>;
    }) => {
      if (await task.waitFor(render.promise)) continued++;
    };
    const a = first.run(callback);
    const b = second.run(callback).then(() => {
      secondFinished = true;
    });
    await flush();
    first.destroy();
    await a;
    expect(secondFinished).toBe(false);
    render.resolve();
    await b;
    expect(continued).toBe(1);
  });

  for (const change of ['abort', 'replace', 'source', 'disable'] as const) {
    it(`does not continue stale work after ${change}`, async () => {
      const manager = await setup();
      let enabled = true;
      const tasks = createDragTasks(manager, () => enabled);
      cleanups.push(tasks.destroy);
      const render = deferred();
      let continued = false;
      const work = tasks.run(async (task) => {
        if (await task.waitFor(render.promise)) continued = true;
      });
      await flush();
      if (change === 'abort') manager.dragOperation.controller!.abort();
      if (change === 'replace')
        manager.dragOperation.controller = new AbortController();
      if (change === 'source') {
        const source = new Draggable({id: 'other', register: false}, manager);
        source.register();
        manager.actions.setDragSource(source);
      }
      if (change === 'disable') enabled = false;
      render.resolve();
      await work;
      expect(continued).toBe(false);
    });
  }

  it('settles rejected rendering and preserves caller disabling', async () => {
    const manager = await setup();
    const tasks = createDragTasks(manager);
    cleanups.push(tasks.destroy);
    const render = deferred();
    let continued = false;
    const work = tasks.run(async (task) => {
      if (await task.waitFor(render.promise)) continued = true;
    });
    await flush();
    manager.collisionObserver.disable();
    render.reject(new Error('render'));
    await work;
    expect(continued).toBe(false);
    expect(manager.collisionObserver.disabled).toBe(true);
  });
});
