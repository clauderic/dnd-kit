import {describe, expect, it} from 'bun:test';
import {arrayMove, arraySwap, move, swap} from '../src/move.ts';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Minimal mock for a non-sortable source (plain Draggable). */
function mockSource(id: string | number) {
  return {id, manager: null} as any;
}

/** Minimal mock for a non-sortable target (plain Droppable). */
function mockTarget(id: string | number) {
  return {id} as any;
}

/**
 * Mock for a sortable source (SortableDraggable).
 * Has `index`, `initialIndex`, `group`, and `initialGroup`.
 */
function mockSortableSource(opts: {
  id: string | number;
  index: number;
  initialIndex: number;
  group?: string | number;
  initialGroup?: string | number;
}) {
  return {
    id: opts.id,
    index: opts.index,
    initialIndex: opts.initialIndex,
    group: opts.group,
    initialGroup: opts.initialGroup,
    manager: null,
  } as any;
}

/** Build a preventable dragover-style event. */
function dragOverEvent(
  source: any,
  target: any,
  canceled = false
) {
  let defaultPrevented = false;
  return {
    operation: {source, target, canceled},
    cancelable: true,
    get defaultPrevented() {
      return defaultPrevented;
    },
    preventDefault() {
      defaultPrevented = true;
    },
  } as any;
}

/** Build a dragend-style event (no preventDefault). */
function dragEndEvent(
  source: any,
  target: any,
  canceled = false
) {
  return {
    operation: {source, target, canceled},
    canceled,
  } as any;
}

// ===========================================================================
// arrayMove / arraySwap
// ===========================================================================

describe('arrayMove', () => {
  it('should move an item forward', () => {
    expect(arrayMove(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should move an item backward', () => {
    expect(arrayMove(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('should return the same array reference when from === to', () => {
    const arr = ['a', 'b', 'c'];
    expect(arrayMove(arr, 1, 1)).toBe(arr);
  });

  it('should not mutate the original array', () => {
    const arr = ['a', 'b', 'c'];
    arrayMove(arr, 0, 2);
    expect(arr).toEqual(['a', 'b', 'c']);
  });
});

describe('arraySwap', () => {
  it('should swap two items', () => {
    expect(arraySwap(['a', 'b', 'c', 'd'], 0, 3)).toEqual(['d', 'b', 'c', 'a']);
  });

  it('should return the same array reference when from === to', () => {
    const arr = ['a', 'b', 'c'];
    expect(arraySwap(arr, 1, 1)).toBe(arr);
  });

  it('should not mutate the original array', () => {
    const arr = ['a', 'b', 'c'];
    arraySwap(arr, 0, 2);
    expect(arr).toEqual(['a', 'b', 'c']);
  });
});

// ===========================================================================
// move – flat array, ID-based (non-sortable fallback)
// ===========================================================================

describe('move – flat array, ID-based fallback', () => {
  it('should move with UniqueIdentifier[] items (strings)', () => {
    const items = ['a', 'b', 'c', 'd'];
    const event = dragOverEvent(mockSource('a'), mockTarget('c'));
    expect(move(items, event)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should move with UniqueIdentifier[] items (numbers)', () => {
    const items = [1, 2, 3, 4];
    const event = dragOverEvent(mockSource(1), mockTarget(3));
    expect(move(items, event)).toEqual([2, 3, 1, 4]);
  });

  it('should move with {id: UniqueIdentifier}[] items', () => {
    const items = [{id: 'a'}, {id: 'b'}, {id: 'c'}];
    const event = dragOverEvent(mockSource('a'), mockTarget('c'));
    expect(move(items, event)).toEqual([{id: 'b'}, {id: 'c'}, {id: 'a'}]);
  });

  it('should return unchanged array when source not found', () => {
    const items = ['a', 'b', 'c'];
    const event = dragOverEvent(mockSource('z'), mockTarget('b'));
    const result = move(items, event);
    expect(result).toBe(items);
  });

  it('should return unchanged array when target not found', () => {
    const items = ['a', 'b', 'c'];
    const event = dragOverEvent(mockSource('a'), mockTarget('z'));
    const result = move(items, event);
    expect(result).toBe(items);
  });

  it('should return unchanged array and call preventDefault when canceled', () => {
    const items = ['a', 'b', 'c'];
    const event = dragOverEvent(mockSource('a'), mockTarget('c'), true);
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged array and call preventDefault when source is null', () => {
    const items = ['a', 'b', 'c'];
    const event = dragOverEvent(null, mockTarget('c'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged array and call preventDefault when target is null', () => {
    const items = ['a', 'b', 'c'];
    const event = dragOverEvent(mockSource('a'), null);
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });
});

// ===========================================================================
// move – flat array, optimistic reconciliation (source.id matches items)
// ===========================================================================

describe('move – flat array, optimistic reconciliation', () => {
  it('should reconcile when source.index differs from ID-found position', () => {
    // Simulates dragend after optimistic sorting:
    // source.id === target.id, items not yet updated, source.index = optimistic position
    const items = ['a', 'b', 'c', 'd'];
    const source = mockSortableSource({
      id: 'a',
      initialIndex: 0,
      index: 2,
    });
    // target.id === source.id (optimistic sorting sets drop target to source)
    const event = dragOverEvent(source, mockTarget('a'));
    // source found at 0 in items, source.index = 2, so reconcile: move(0, 2)
    expect(move(items, event)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should not reconcile when source.index matches ID-found position', () => {
    // After items have been updated, source position matches
    const items = ['b', 'c', 'a', 'd'];
    const source = mockSortableSource({
      id: 'a',
      initialIndex: 0,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('a'));
    // source found at 2 in items, source.index = 2, no reconciliation needed
    // mutation(items, 2, 2) returns the same array since from === to
    const result = move(items, event);
    expect(result).toBe(items);
  });

  it('should reconcile with dragend events', () => {
    const items = ['a', 'b', 'c', 'd'];
    const source = mockSortableSource({
      id: 'a',
      initialIndex: 0,
      index: 3,
    });
    const event = dragEndEvent(source, mockTarget('a'));
    expect(move(items, event)).toEqual(['b', 'c', 'd', 'a']);
  });
});

// ===========================================================================
// move – flat array, sortable fallback (computed IDs)
// ===========================================================================

describe('move – flat array, sortable fallback (computed IDs)', () => {
  it('should use sortable indices when ID lookup fails', () => {
    const items = ['apple', 'banana', 'cherry'];
    const source = mockSortableSource({
      id: 'sortable-0', // computed ID, does NOT match 'apple'
      initialIndex: 0,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-0'));
    expect(move(items, event)).toEqual(['banana', 'cherry', 'apple']);
  });

  it('should work with {id} object items and computed IDs', () => {
    const items = [{id: 1}, {id: 2}, {id: 3}];
    const source = mockSortableSource({
      id: 'sortable-1', // does not match item.id
      initialIndex: 0,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-1'));
    expect(move(items, event)).toEqual([{id: 2}, {id: 3}, {id: 1}]);
  });

  it('should return unchanged when initialIndex === index (no movement)', () => {
    const items = ['apple', 'banana', 'cherry'];
    const source = mockSortableSource({
      id: 'sortable-1',
      initialIndex: 1,
      index: 1,
    });
    const event = dragOverEvent(source, mockTarget('sortable-1'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged when initialIndex is out of bounds (negative)', () => {
    const items = ['a', 'b', 'c'];
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: -1,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged when initialIndex is out of bounds (too large)', () => {
    const items = ['a', 'b', 'c'];
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: 10,
      index: 1,
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should work with dragend events', () => {
    const items = ['apple', 'banana', 'cherry', 'date'];
    const source = mockSortableSource({
      id: 'sortable-0',
      initialIndex: 0,
      index: 3,
    });
    const event = dragEndEvent(source, mockTarget('sortable-0'));
    expect(move(items, event)).toEqual(['banana', 'cherry', 'date', 'apple']);
  });
});

// ===========================================================================
// move – grouped record, ID-based fallback
// ===========================================================================

describe('move – grouped record, ID-based fallback', () => {
  it('should reorder within the same group', () => {
    const items = {
      A: ['a1', 'a2', 'a3'],
      B: ['b1', 'b2'],
    };
    const source = mockSource('a1');
    source.manager = {
      dragOperation: {
        position: {current: {x: 0, y: 0}},
        shape: null,
      },
    };
    const event = dragOverEvent(source, mockTarget('a3'));
    expect(move(items, event)).toEqual({
      A: ['a2', 'a3', 'a1'],
      B: ['b1', 'b2'],
    });
  });

  it('should return unchanged when source not found in any group', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSource('z');
    source.manager = {
      dragOperation: {
        position: {current: {x: 0, y: 0}},
        shape: null,
      },
    };
    const event = dragOverEvent(source, mockTarget('a1'));
    const result = move(items, event);
    expect(result).toBe(items);
  });
});

// ===========================================================================
// move – grouped record, optimistic reconciliation
// ===========================================================================

describe('move – grouped record, optimistic reconciliation', () => {
  it('should reconcile same-group reorder when source.id === target.id', () => {
    // Simulates dragend after optimistic sorting in a single group
    const items = {
      A: ['a1', 'a2', 'a3'],
      B: ['b1', 'b2'],
    };
    const source = mockSortableSource({
      id: 'a1',
      initialIndex: 0,
      index: 2,
      initialGroup: 'A',
      group: 'A',
    });
    source.manager = {
      dragOperation: {
        position: {current: {x: 0, y: 0}},
        shape: null,
      },
    };
    // source.id === target.id (optimistic sorting)
    const event = dragOverEvent(source, mockTarget('a1'));
    expect(move(items, event)).toEqual({
      A: ['a2', 'a3', 'a1'],
      B: ['b1', 'b2'],
    });
  });

  it('should reconcile cross-group transfer when source.id === target.id', () => {
    // Simulates dragend after optimistic cross-group sorting
    const items = {
      A: ['a1', 'a2', 'a3'],
      B: ['b1', 'b2'],
    };
    const source = mockSortableSource({
      id: 'a2',
      initialIndex: 1,
      index: 0,
      initialGroup: 'A',
      group: 'B',
    });
    source.manager = {
      dragOperation: {
        position: {current: {x: 0, y: 0}},
        shape: null,
      },
    };
    const event = dragOverEvent(source, mockTarget('a2'));
    expect(move(items, event)).toEqual({
      A: ['a1', 'a3'],
      B: ['a2', 'b1', 'b2'],
    });
  });

  it('should not reconcile when positions already match (items updated)', () => {
    // After items have been updated, positions match
    const items = {
      A: ['a2', 'a3', 'a1'],
      B: ['b1', 'b2'],
    };
    const source = mockSortableSource({
      id: 'a1',
      initialIndex: 0,
      index: 2,
      initialGroup: 'A',
      group: 'A',
    });
    source.manager = {
      dragOperation: {
        position: {current: {x: 0, y: 0}},
        shape: null,
      },
    };
    // source.id === target.id, source found at index 2 in A, source.index = 2 → no reconciliation
    const event = dragOverEvent(source, mockTarget('a1'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });
});

// ===========================================================================
// move – grouped record, sortable fallback (computed IDs)
// ===========================================================================

describe('move – grouped record, sortable fallback (computed IDs)', () => {
  it('should reorder within the same group using sortable indices', () => {
    const items = {
      col1: [{id: 1}, {id: 2}, {id: 3}],
      col2: [{id: 4}, {id: 5}],
    };
    const source = mockSortableSource({
      id: 'sortable-1', // computed, does not match item.id
      initialIndex: 0,
      index: 2,
      initialGroup: 'col1',
      group: 'col1',
    });
    const event = dragOverEvent(source, mockTarget('sortable-1'));
    expect(move(items, event)).toEqual({
      col1: [{id: 2}, {id: 3}, {id: 1}],
      col2: [{id: 4}, {id: 5}],
    });
  });

  it('should transfer across groups using sortable indices', () => {
    const items = {
      col1: [{id: 1}, {id: 2}],
      col2: [{id: 3}, {id: 4}],
    };
    const source = mockSortableSource({
      id: 'sortable-1',
      initialIndex: 0,
      index: 1,
      initialGroup: 'col1',
      group: 'col2',
    });
    const event = dragOverEvent(source, mockTarget('sortable-1'));
    expect(move(items, event)).toEqual({
      col1: [{id: 2}],
      col2: [{id: 3}, {id: 1}, {id: 4}],
    });
  });

  it('should return unchanged when source and target index/group are the same', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: 0,
      index: 0,
      initialGroup: 'A',
      group: 'A',
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged when initialGroup is not a valid record key', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: 0,
      index: 0,
      initialGroup: 'INVALID',
      group: 'A',
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged when group is not a valid record key', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: 0,
      index: 0,
      initialGroup: 'A',
      group: 'INVALID',
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged when initialGroup is undefined', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: 0,
      index: 1,
      initialGroup: undefined,
      group: 'A',
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should return unchanged when group is undefined', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-x',
      initialIndex: 0,
      index: 1,
      initialGroup: 'A',
      group: undefined,
    });
    const event = dragOverEvent(source, mockTarget('sortable-x'));
    const result = move(items, event);
    expect(result).toBe(items);
    expect(event.defaultPrevented).toBe(true);
  });
});

// ===========================================================================
// swap – flat array
// ===========================================================================

describe('swap – flat array', () => {
  it('should swap with ID-based fallback', () => {
    const items = ['a', 'b', 'c', 'd'];
    const event = dragOverEvent(mockSource('a'), mockTarget('d'));
    expect(swap(items, event)).toEqual(['d', 'b', 'c', 'a']);
  });

  it('should swap using optimistic reconciliation', () => {
    const items = ['a', 'b', 'c', 'd'];
    const source = mockSortableSource({
      id: 'a',
      initialIndex: 0,
      index: 3,
    });
    const event = dragOverEvent(source, mockTarget('a'));
    expect(swap(items, event)).toEqual(['d', 'b', 'c', 'a']);
  });

  it('should swap with computed IDs (sortable fallback)', () => {
    const items = ['apple', 'banana', 'cherry'];
    const source = mockSortableSource({
      id: 'sortable-0',
      initialIndex: 0,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-0'));
    expect(swap(items, event)).toEqual(['cherry', 'banana', 'apple']);
  });
});

// ===========================================================================
// swap – grouped record
// ===========================================================================

describe('swap – grouped record', () => {
  it('should swap within the same group using optimistic reconciliation', () => {
    const items = {
      A: ['a1', 'a2', 'a3'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'a1',
      initialIndex: 0,
      index: 2,
      initialGroup: 'A',
      group: 'A',
    });
    source.manager = {
      dragOperation: {
        position: {current: {x: 0, y: 0}},
        shape: null,
      },
    };
    const event = dragOverEvent(source, mockTarget('a1'));
    expect(swap(items, event)).toEqual({
      A: ['a3', 'a2', 'a1'],
      B: ['b1'],
    });
  });

  it('should swap with computed IDs (sortable fallback)', () => {
    const items = {
      A: ['a1', 'a2', 'a3'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-a1',
      initialIndex: 0,
      index: 2,
      initialGroup: 'A',
      group: 'A',
    });
    const event = dragOverEvent(source, mockTarget('sortable-a1'));
    expect(swap(items, event)).toEqual({
      A: ['a3', 'a2', 'a1'],
      B: ['b1'],
    });
  });

  it('should do a move (not swap) for cross-group transfers', () => {
    // Cross-group always does remove+insert regardless of move vs swap
    const items = {
      A: ['a1', 'a2'],
      B: ['b1', 'b2'],
    };
    const source = mockSortableSource({
      id: 'sortable-a1',
      initialIndex: 0,
      index: 1,
      initialGroup: 'A',
      group: 'B',
    });
    const event = dragOverEvent(source, mockTarget('sortable-a1'));
    expect(swap(items, event)).toEqual({
      A: ['a2'],
      B: ['b1', 'a1', 'b2'],
    });
  });
});

// ===========================================================================
// Edge cases
// ===========================================================================

describe('move – edge cases', () => {
  it('should handle single-element flat array (no-op)', () => {
    const items = ['a'];
    const source = mockSortableSource({
      id: 'sortable-a',
      initialIndex: 0,
      index: 0,
    });
    const event = dragOverEvent(source, mockTarget('sortable-a'));
    const result = move(items, event);
    expect(result).toBe(items);
  });

  it('should handle moving to the beginning of a flat array', () => {
    const items = ['a', 'b', 'c'];
    const source = mockSortableSource({
      id: 'sortable-c',
      initialIndex: 2,
      index: 0,
    });
    const event = dragOverEvent(source, mockTarget('sortable-c'));
    expect(move(items, event)).toEqual(['c', 'a', 'b']);
  });

  it('should handle moving to the end of a flat array', () => {
    const items = ['a', 'b', 'c'];
    const source = mockSortableSource({
      id: 'sortable-a',
      initialIndex: 0,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-a'));
    expect(move(items, event)).toEqual(['b', 'c', 'a']);
  });

  it('should handle canceled dragend event with sortable source', () => {
    const items = ['a', 'b', 'c'];
    const source = mockSortableSource({
      id: 'sortable-a',
      initialIndex: 0,
      index: 2,
    });
    // dragend events don't have preventDefault
    const event = dragEndEvent(source, mockTarget('sortable-a'), true);
    const result = move(items, event);
    expect(result).toBe(items);
  });

  it('should handle adjacent item move', () => {
    const items = ['a', 'b', 'c', 'd'];
    const source = mockSortableSource({
      id: 'sortable-b',
      initialIndex: 1,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-b'));
    expect(move(items, event)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('should not mutate the original items array', () => {
    const items = ['a', 'b', 'c'];
    const source = mockSortableSource({
      id: 'sortable-a',
      initialIndex: 0,
      index: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-a'));
    move(items, event);
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('should not mutate the original items record', () => {
    const items = {
      A: ['a1', 'a2'],
      B: ['b1'],
    };
    const source = mockSortableSource({
      id: 'sortable-a1',
      initialIndex: 0,
      index: 0,
      initialGroup: 'A',
      group: 'B',
    });
    const event = dragOverEvent(source, mockTarget('sortable-a1'));
    move(items, event);
    expect(items).toEqual({
      A: ['a1', 'a2'],
      B: ['b1'],
    });
  });

  it('should handle number IDs in grouped record with sortable fallback', () => {
    const items = {
      1: [10, 20, 30],
      2: [40, 50],
    };
    const source = mockSortableSource({
      id: 'sortable-10',
      initialIndex: 0,
      index: 1,
      initialGroup: 1,
      group: 2,
    });
    const event = dragOverEvent(source, mockTarget('sortable-10'));
    expect(move(items, event)).toEqual({
      1: [20, 30],
      2: [40, 10, 50],
    });
  });

  it('should use ID-based path when IDs match (even with sortable indices)', () => {
    // When source.id matches items AND source.id !== target.id, use standard move
    const items = ['a', 'b', 'c', 'd'];
    const source = mockSortableSource({
      id: 'b',
      initialIndex: 1,
      index: 1,
    });
    const event = dragOverEvent(source, mockTarget('d'));
    // ID-based: sourceIndex=1, targetIndex=3 → move(1,3)
    expect(move(items, event)).toEqual(['a', 'c', 'd', 'b']);
  });
});
