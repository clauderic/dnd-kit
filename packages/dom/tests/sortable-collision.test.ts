import {describe, expect, it} from 'bun:test';

import {Rectangle} from '@dnd-kit/geometry';
import {Sortable} from '@dnd-kit/dom/sortable';

function createSortable(
  id: string,
  index: number,
  [top, height]: [number, number],
  group?: string
) {
  const sortable = new Sortable(
    {id, index, group, plugins: [], transition: null},
    undefined
  );

  sortable.droppable.shape = new Rectangle(0, top, 100, height);

  return sortable;
}

function collides(source: Sortable, target: Sortable, y: number) {
  const dragOperation = {
    source: source.draggable,
    position: {current: {x: 50, y}},
    shape: null,
  };

  return (
    target.droppable.collisionDetector({
      dragOperation,
      droppable: target.droppable,
    } as any) !== null
  );
}

describe('sortable collision detection', () => {
  it('ignores the part of a taller sibling the source cannot cover', () => {
    const taller = createSortable('taller', 0, [0, 150]);
    const source = createSortable('source', 1, [150, 50]);

    expect(collides(source, taller, 120)).toBe(false);
    expect(collides(source, taller, 40)).toBe(true);
  });

  it('applies the same area when moving towards the end', () => {
    const source = createSortable('source', 0, [0, 50]);
    const taller = createSortable('taller', 1, [50, 150]);

    expect(collides(source, taller, 80)).toBe(false);
    expect(collides(source, taller, 160)).toBe(true);
  });

  it('collides anywhere over a sibling of equal or smaller size', () => {
    const sibling = createSortable('sibling', 0, [0, 50]);
    const equal = createSortable('equal', 1, [50, 50]);
    const taller = createSortable('taller', 2, [100, 150]);

    expect(collides(equal, sibling, 45)).toBe(true);
    expect(collides(taller, sibling, 45)).toBe(true);
  });

  it('keeps default detection across groups', () => {
    const taller = createSortable('taller', 0, [0, 150], 'a');
    const source = createSortable('source', 0, [150, 50], 'b');

    expect(collides(source, taller, 120)).toBe(true);
  });
});
