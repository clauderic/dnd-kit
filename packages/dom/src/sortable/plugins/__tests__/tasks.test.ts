import {describe, expect, it, mock} from 'bun:test';
import type {Droppable} from '@dnd-kit/dom';
import {createSetup, ElementFixture, deferred, flush} from './fixtures.ts';
import {createSortableTasks} from '../tasks.ts';

describe('Sortable handler work', () => {
  it('refreshes affected rows and old/new ancestors before completion', async () => {
    const setup = createSetup();
    const nextParent = new ElementFixture();
    const previousRefresh = mock(() => {});
    const nextRefresh = mock(() => {});
    setup.droppables.set('old', {
      id: 'old',
      element: setup.parent,
      refreshShape: previousRefresh,
    } as unknown as Droppable);
    setup.droppables.set('new', {
      id: 'new',
      element: nextParent,
      refreshShape: nextRefresh,
    } as unknown as Droppable);
    const tasks = createSortableTasks(setup.manager);
    const render = deferred();
    const source = setup.items[0].droppable;
    const work = tasks.run([source], async (task) => {
      if (!(await task.waitFor(render.promise))) return;
      const element = setup.parent.children.shift()!;
      nextParent.children.push(element);
      element.parentElement = nextParent;
    });
    expect(previousRefresh).not.toHaveBeenCalled();
    render.resolve();
    await work;
    expect(previousRefresh).toHaveBeenCalledTimes(1);
    expect(nextRefresh).toHaveBeenCalledTimes(1);
    expect(source.refreshShape).toHaveBeenCalledTimes(1);
    expect(setup.items[1].droppable.refreshShape).not.toHaveBeenCalled();
    tasks.destroy();
  });

  it('destroying one plugin finishes only its work and invalidates continuations', async () => {
    const setup = createSetup();
    const first = createSortableTasks(setup.manager);
    const second = createSortableTasks(setup.manager);
    const render = deferred();
    let continued = 0;
    let secondFinished = false;
    const callback = async (task: {
      waitFor(work: Promise<void>): Promise<boolean>;
    }) => {
      if (await task.waitFor(render.promise)) continued++;
    };
    const a = first.run([], callback);
    const b = second.run([], callback).then(() => {
      secondFinished = true;
    });
    await flush();
    first.destroy();
    await a;
    expect(secondFinished).toBe(false);
    render.resolve();
    await b;
    expect(continued).toBe(1);
    second.destroy();
  });

  for (const change of ['abort', 'replace'] as const) {
    it(`does not measure or continue stale work after ${change}`, async () => {
      const setup = createSetup();
      const tasks = createSortableTasks(setup.manager);
      const render = deferred();
      let continued = false;
      const work = tasks.run([setup.items[0].droppable], async (task) => {
        if (await task.waitFor(render.promise)) continued = true;
      });
      await flush();
      if (change === 'abort') setup.operation.controller.abort();
      setup.operation.controller = new AbortController();
      render.resolve();
      await work;
      expect(continued).toBe(false);
      expect(setup.items[0].droppable.refreshShape).not.toHaveBeenCalled();
      tasks.destroy();
    });
  }

  it('settles rejected rendering and preserves caller disabling', async () => {
    const setup = createSetup();
    const tasks = createSortableTasks(setup.manager);
    const render = deferred();
    let continued = false;
    const work = tasks.run([], async (task) => {
      if (await task.waitFor(render.promise)) continued = true;
    });
    await flush();
    setup.fixture.collisionObserver.disabled = true;
    render.reject(new Error('render'));
    await work;
    expect(continued).toBe(false);
    expect(setup.fixture.collisionObserver.disabled).toBe(true);
    expect(setup.fixture.collisionObserver.enable).not.toHaveBeenCalled();
    tasks.destroy();
  });

  it('rejects failed measurement without leaving later work blocked', async () => {
    const setup = createSetup();
    const tasks = createSortableTasks(setup.manager);
    setup.items[0].droppable.refreshShape = () => {
      throw new Error('measure');
    };
    await expect(
      tasks.run([setup.items[0].droppable], async () => {})
    ).rejects.toThrow('measure');
    await tasks.run([], async () => {});
    tasks.destroy();
  });
});
