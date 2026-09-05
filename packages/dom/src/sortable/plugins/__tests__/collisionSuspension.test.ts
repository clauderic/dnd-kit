import {describe, expect, it, mock} from 'bun:test';
import type {Droppable} from '@dnd-kit/dom';

import {
  createSetup,
  ElementFixture,
  createCollisionSuspension,
} from './fixtures.ts';

describe('private sortable collision suspension', () => {
  for (const reverse of [false, true]) {
    it(`retains overlapping ownership when released ${reverse ? 'in reverse' : 'in order'}`, async () => {
      const setup = createSetup();
      const optimistic = createCollisionSuspension(setup.manager);
      const keyboard = createCollisionSuspension(setup.manager);
      const first = optimistic.acquire()!;
      const second = keyboard.acquire()!;
      const owners = reverse ? [second, first] : [first, second];

      expect(setup.collision().defaultPrevented).toBe(true);
      owners[0].release();
      owners[0].release();
      expect(setup.collision().defaultPrevented).toBe(true);
      expect(
        setup.fixture.collisionObserver.forceUpdate
      ).not.toHaveBeenCalled();
      owners[1].release();
      await Promise.all([first.finished, second.finished]);
      expect(setup.collision().defaultPrevented).toBe(false);
      expect(setup.fixture.collisionObserver.forceUpdate).toHaveBeenCalledTimes(
        1
      );
      optimistic.destroy();
      keyboard.destroy();
    });
  }

  it('does not clear an external disable, including one acquired while sorting', () => {
    const setup = createSetup();
    const owner = createCollisionSuspension(setup.manager);
    const suspension = owner.acquire()!;
    setup.fixture.collisionObserver.disabled = true;
    suspension.release();

    expect(setup.fixture.collisionObserver.disabled).toBe(true);
    expect(setup.fixture.collisionObserver.enable).not.toHaveBeenCalled();
    expect(setup.fixture.collisionObserver.disable).not.toHaveBeenCalled();
    owner.destroy();
  });

  it('refreshes affected rows and old/new ancestor surfaces before reopening', () => {
    const setup = createSetup();
    const previousParent = setup.parent;
    const nextParent = new ElementFixture();
    const previousRefresh = mock(() => {
      expect(setup.collision().defaultPrevented).toBe(true);
    });
    const nextRefresh = mock(() => {
      expect(setup.collision().defaultPrevented).toBe(true);
    });
    setup.droppables.set('old', {
      id: 'old',
      element: previousParent,
      refreshShape: previousRefresh,
    } as unknown as Droppable);
    setup.droppables.set('new', {
      id: 'new',
      element: nextParent,
      refreshShape: nextRefresh,
    } as unknown as Droppable);
    const owner = createCollisionSuspension(setup.manager);
    const source = setup.items[0].droppable;
    const suspension = owner.acquire([source])!;
    const element = previousParent.children.shift()!;
    nextParent.children.push(element);
    element.parentElement = nextParent;
    setup.fixture.collisionObserver.forceUpdate.mockImplementation(() => {
      expect(previousRefresh).toHaveBeenCalledTimes(1);
      expect(nextRefresh).toHaveBeenCalledTimes(1);
      expect(setup.collision().defaultPrevented).toBe(false);
    });
    suspension.release();

    expect(source.refreshShape).toHaveBeenCalledTimes(1);
    expect(setup.items[1].droppable.refreshShape).not.toHaveBeenCalled();
    owner.destroy();
  });

  it('resolves waiting owners on abort and makes old releases inert in a new drag', async () => {
    const setup = createSetup();
    const owner = createCollisionSuspension(setup.manager);
    const first = owner.acquire([setup.items[0].droppable])!;
    setup.operation.controller.abort();
    await first.finished;
    expect(first.current).toBe(false);
    expect(setup.collision().defaultPrevented).toBe(false);
    expect(setup.fixture.collisionObserver.forceUpdate).not.toHaveBeenCalled();
    setup.operation.controller = new AbortController();
    const second = owner.acquire()!;
    first.release();
    expect(setup.collision().defaultPrevented).toBe(true);
    expect(second.current).toBe(true);
    second.release();
    owner.destroy();
  });

  it('invalidates a replaced controller even if it was not aborted', () => {
    const setup = createSetup();
    const owner = createCollisionSuspension(setup.manager);
    const first = owner.acquire()!;
    setup.operation.controller = new AbortController();
    const second = owner.acquire()!;
    expect(first.current).toBe(false);
    first.release();
    expect(setup.collision().defaultPrevented).toBe(true);
    expect(setup.fixture.collisionObserver.forceUpdate).not.toHaveBeenCalled();
    second.release();
    owner.destroy();
  });

  it('destroying one plugin releases only its owners', () => {
    const setup = createSetup();
    const first = createCollisionSuspension(setup.manager);
    const second = createCollisionSuspension(setup.manager);
    const a = first.acquire()!;
    const b = second.acquire()!;
    first.destroy();
    expect(a.current).toBe(false);
    expect(first.acquire()).toBeUndefined();
    expect(b.current).toBe(true);
    expect(setup.collision().defaultPrevented).toBe(true);
    second.destroy();
    expect(setup.collision().defaultPrevented).toBe(false);
  });

  it('waits for optimistic ownership without waiting for its own keyboard token', async () => {
    const setup = createSetup();
    const owner = createCollisionSuspension(setup.manager);
    const keyboard = owner.acquire()!;
    const optimistic = owner.acquire()!;
    let finished = false;
    const waiting = keyboard.waitForOthers().then(() => {
      finished = true;
    });
    await Promise.resolve();
    expect(finished).toBe(false);
    optimistic.release();
    await waiting;
    expect(finished).toBe(true);
    expect(setup.collision().defaultPrevented).toBe(true);
    keyboard.release();
    owner.destroy();
  });

  it('releases its gate even when committed measurement throws', async () => {
    const setup = createSetup();
    const owner = createCollisionSuspension(setup.manager);
    const source = setup.items[0].droppable;
    source.refreshShape = () => {
      throw new Error('measurement');
    };
    const suspension = owner.acquire([source])!;
    expect(() => suspension.release()).toThrow('measurement');
    await suspension.finished;
    expect(setup.collision().defaultPrevented).toBe(false);
    owner.destroy();
  });
});
