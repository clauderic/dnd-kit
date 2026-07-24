import {describe, expect, it, jest} from 'bun:test';
import type {DragDropManager} from '@dnd-kit/abstract';

import {AutoScroller} from '../src/core/plugins/scrolling/AutoScroller.ts';
import {Scroller} from '../src/core/plugins/scrolling/Scroller.ts';

function createManager(scroller: Pick<Scroller, 'autoScrolling' | 'scroll'>) {
  return {
    dragOperation: {
      position: {current: {x: 0, y: 0}},
      status: {dragging: true},
    },
    registry: {
      plugins: {
        get(plugin: unknown) {
          return plugin === Scroller ? scroller : undefined;
        },
      },
    },
  } as DragDropManager<any, any>;
}

describe('AutoScroller', () => {
  it('resets the scroller state when auto-scrolling is cleaned up', () => {
    const scroller = {
      autoScrolling: false,
      scroll: jest.fn(() => true),
    };
    const autoScroller = new AutoScroller(createManager(scroller));

    expect(scroller.autoScrolling).toBe(true);

    autoScroller.destroy();

    expect(scroller.autoScrolling).toBe(false);
  });
});
