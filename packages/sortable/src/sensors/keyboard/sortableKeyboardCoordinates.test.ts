/**
 * @jest-environment jsdom
 */
import type {MutableRefObject} from 'react';
import type {
  Active,
  ClientRect,
  DroppableContainer,
  SensorContext,
  UniqueIdentifier,
} from '@dnd-kit/core';

import {sortableKeyboardCoordinates} from './sortableKeyboardCoordinates';
import type {SortableData} from '../../types';

// --- Minimal Mock Infrastructure ---

class MockDroppableContainersMap extends Map<
  UniqueIdentifier,
  DroppableContainer
> {
  get(id: UniqueIdentifier | null | undefined) {
    return id != null ? super.get(id) : undefined;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter(({disabled}) => !disabled);
  }
  getNodeFor(id: UniqueIdentifier | null | undefined) {
    return this.get(id)?.node.current ?? undefined;
  }
}

function rect(
  left: number,
  top: number,
  width: number,
  height: number
): ClientRect {
  return {left, top, width, height, right: left + width, bottom: top + height};
}

function container(
  id: string,
  containerId: string,
  index: number,
  items: string[],
  disabled = false
): DroppableContainer {
  return {
    id,
    key: id,
    disabled,
    node: {
      current: document.createElement('div'),
    } as MutableRefObject<HTMLElement>,
    rect: {current: null} as MutableRefObject<ClientRect | null>,
    data: {
      current: {sortable: {containerId, index, items}},
    } as MutableRefObject<SortableData>,
  };
}

function keyEvent(code: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {code});
  event.preventDefault = jest.fn();
  return event;
}

function active(id: UniqueIdentifier): Active {
  return {
    id,
    data: {current: undefined} as MutableRefObject<undefined>,
    rect: {
      current: {initial: null, translated: null},
    } as MutableRefObject<{
      initial: ClientRect | null;
      translated: ClientRect | null;
    }>,
  };
}

interface SetupOptions {
  rects: [ClientRect, ClientRect];
  activeIndex?: 0 | 1;
  containerIds?: [string, string];
  disabled?: [boolean, boolean];
}

function setup({
  rects,
  activeIndex = 0,
  containerIds = ['c', 'c'],
  disabled = [false, false],
}: SetupOptions) {
  const items = ['A', 'B'];
  const containers = new MockDroppableContainersMap();
  containers.set('A', container('A', containerIds[0], 0, items, disabled[0]));
  containers.set('B', container('B', containerIds[1], 1, items, disabled[1]));

  const droppableRects = new Map<UniqueIdentifier, ClientRect>();
  droppableRects.set('A', rects[0]);
  droppableRects.set('B', rects[1]);

  const activeId = activeIndex === 0 ? 'A' : 'B';
  return {
    active: activeId,
    currentCoordinates: {x: 0, y: 0},
    context: {
      activatorEvent: null,
      active: active(activeId),
      activeNode: null,
      collisionRect: rects[activeIndex],
      collisions: null,
      draggableNodes: new Map(),
      draggingNode: null,
      draggingNodeRect: null,
      droppableRects,
      droppableContainers:
        containers as unknown as SensorContext['droppableContainers'],
      over: null,
      scrollableAncestors: [],
      scrollAdjustedTranslate: null,
    } as SensorContext,
  };
}

// --- Tests ---

describe('sortableKeyboardCoordinates', () => {
  describe('offset application', () => {
    // The bug: `offset.x && offset.y ? rectCoordinates : subtract(rectCoordinates, offset)`
    // When both offsets are non-zero, it skipped subtraction. Fix: always subtract.

    it('applies offset when both dimensions differ (bug repro)', () => {
      // A: 100x50 at (0,0), B: 80x30 at (100,0) → offset {20,20}
      // Bug returned {100,0}, fix returns {80,-20}
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(100, 0, 80, 30)]});
      expect(sortableKeyboardCoordinates(keyEvent('ArrowRight'), ctx)).toEqual({
        x: 80,
        y: -20,
      });
    });

    it('applies offset when only height differs', () => {
      // A: 100x50, B: 100x30 below → offset {0,20}
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 30)]});
      expect(sortableKeyboardCoordinates(keyEvent('ArrowDown'), ctx)).toEqual({
        x: 0,
        y: 30,
      });
    });

    it('applies offset when only width differs', () => {
      // A: 100x50, B: 80x50 to right → offset {20,0}
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(100, 0, 80, 50)]});
      expect(sortableKeyboardCoordinates(keyEvent('ArrowRight'), ctx)).toEqual({
        x: 80,
        y: 0,
      });
    });

    it('handles negative offset (moving to larger item)', () => {
      // A: 100x30, B: 100x50 below → offset {0,-20}
      const ctx = setup({rects: [rect(0, 0, 100, 30), rect(0, 30, 100, 50)]});
      expect(sortableKeyboardCoordinates(keyEvent('ArrowDown'), ctx)).toEqual({
        x: 0,
        y: 50,
      });
    });

    it('handles zero offset (same size items)', () => {
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 50)]});
      expect(sortableKeyboardCoordinates(keyEvent('ArrowDown'), ctx)).toEqual({
        x: 0,
        y: 50,
      });
    });
  });

  describe('directional movement', () => {
    it('moves up', () => {
      const ctx = setup({
        rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 50)],
        activeIndex: 1,
      });
      expect(sortableKeyboardCoordinates(keyEvent('ArrowUp'), ctx)).toEqual({
        x: 0,
        y: 0,
      });
    });

    it('moves left', () => {
      const ctx = setup({
        rects: [rect(0, 0, 100, 50), rect(100, 0, 100, 50)],
        activeIndex: 1,
      });
      expect(sortableKeyboardCoordinates(keyEvent('ArrowLeft'), ctx)).toEqual({
        x: 0,
        y: 0,
      });
    });
  });

  describe('edge cases', () => {
    it('returns undefined for non-directional keys', () => {
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 50)]});
      expect(sortableKeyboardCoordinates(keyEvent('Tab'), ctx)).toBeUndefined();
    });

    it('returns undefined when no target in direction', () => {
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 50)]});
      // A is active, nothing above it
      expect(
        sortableKeyboardCoordinates(keyEvent('ArrowUp'), ctx)
      ).toBeUndefined();
    });

    it('returns undefined when no collisionRect', () => {
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 50)]});
      ctx.context.collisionRect = null;
      expect(
        sortableKeyboardCoordinates(keyEvent('ArrowDown'), ctx)
      ).toBeUndefined();
    });

    it('returns undefined when no active', () => {
      const ctx = setup({rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 50)]});
      ctx.context.active = null;
      expect(
        sortableKeyboardCoordinates(keyEvent('ArrowDown'), ctx)
      ).toBeUndefined();
    });
  });

  describe('cross-container', () => {
    it('does not apply offset between different containers', () => {
      // Different containers → offset is {0,0} regardless of size difference
      const ctx = setup({
        rects: [rect(0, 0, 100, 50), rect(0, 50, 100, 30)],
        containerIds: ['c1', 'c2'],
      });
      expect(sortableKeyboardCoordinates(keyEvent('ArrowDown'), ctx)).toEqual({
        x: 0,
        y: 50,
      });
    });
  });
});
