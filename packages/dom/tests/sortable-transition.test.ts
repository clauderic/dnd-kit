import {describe, expect, it} from 'bun:test';

import {
  Sortable,
  defaultSortableTransition,
  resolveSortableTransition,
} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';

function createSortable(input: Partial<SortableInput<any>> = {}) {
  return new Sortable({id: 's1', index: 0, ...input}, undefined);
}

describe('resolveSortableTransition', () => {
  it('falls back to the default transition when omitted', () => {
    expect(resolveSortableTransition(undefined)).toEqual(
      defaultSortableTransition
    );
  });

  it('merges partial transitions with the default transition', () => {
    expect(resolveSortableTransition({duration: 150})).toEqual({
      ...defaultSortableTransition,
      duration: 150,
    });
  });

  it('preserves null so that transitions can be disabled', () => {
    expect(resolveSortableTransition(null)).toBeNull();
  });
});

describe('Sortable transition', () => {
  it('defaults to the default transition when omitted', () => {
    expect(createSortable().transition).toEqual(defaultSortableTransition);
  });

  it('preserves an explicit null transition', () => {
    expect(createSortable({transition: null}).transition).toBeNull();
  });

  it('can be updated from a transition to null', () => {
    const sortable = createSortable();
    sortable.transition = resolveSortableTransition(null);

    expect(sortable.transition).toBeNull();
  });
});
