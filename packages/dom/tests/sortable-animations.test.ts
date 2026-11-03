import {describe, expect, it} from 'bun:test';

import {scheduleAnimation} from '../src/sortable/animations.ts';

function createAnimation(
  id: string,
  calls: string[],
  {ready = true, moved = true} = {}
) {
  return {
    prepare() {
      calls.push(`prepare ${id}`);
      return ready;
    },
    measure() {
      calls.push(`measure ${id}`);
      return moved;
    },
    animate() {
      calls.push(`animate ${id}`);
    },
  };
}

describe('scheduleAnimation', () => {
  it('prepares and measures every sortable before animating any of them', async () => {
    const calls: string[] = [];

    scheduleAnimation(createAnimation('a', calls));
    scheduleAnimation(createAnimation('b', calls));
    scheduleAnimation(createAnimation('c', calls));

    expect(calls).toEqual([]);

    await Promise.resolve();

    expect(calls).toEqual([
      'prepare a',
      'prepare b',
      'prepare c',
      'measure a',
      'measure b',
      'measure c',
      'animate a',
      'animate b',
      'animate c',
    ]);
  });

  it('skips sortables that are not ready or did not move', async () => {
    const calls: string[] = [];

    scheduleAnimation(createAnimation('a', calls, {ready: false}));
    scheduleAnimation(createAnimation('b', calls, {moved: false}));
    scheduleAnimation(createAnimation('c', calls));

    await Promise.resolve();

    expect(calls).toEqual([
      'prepare a',
      'prepare b',
      'prepare c',
      'measure b',
      'measure c',
      'animate c',
    ]);
  });

  it('starts a new batch after flushing', async () => {
    const calls: string[] = [];

    scheduleAnimation(createAnimation('a', calls));
    await Promise.resolve();

    scheduleAnimation(createAnimation('b', calls));
    await Promise.resolve();

    expect(calls).toEqual([
      'prepare a',
      'measure a',
      'animate a',
      'prepare b',
      'measure b',
      'animate b',
    ]);
  });
});
