import {describe, expect, it} from 'bun:test';

import {Draggable, Droppable} from '@dnd-kit/dom';
import {
  Sortable,
  SortableDraggable,
  SortableDroppable,
  isSortable,
  isSortableOperation,
} from '@dnd-kit/dom/sortable';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSortable(id: string | number, index: number, group?: string) {
  const sortable = new Sortable(
    {id, index, group, plugins: [], transition: null},
    undefined
  );
  return sortable;
}

function createDraggable(id: string | number) {
  return new Draggable({id}, undefined);
}

function createDroppable(id: string | number) {
  return new Droppable({id}, undefined);
}

function mockOperation(
  source: any,
  target: any
): {source: any; target: any; canceled: boolean} {
  return {source, target, canceled: false};
}

// ---------------------------------------------------------------------------
// isSortable
// ---------------------------------------------------------------------------

describe('isSortable', () => {
  it('should return true for a SortableDraggable', () => {
    const sortable = createSortable('s1', 0);
    expect(isSortable(sortable.draggable)).toBe(true);
    expect(sortable.draggable).toBeInstanceOf(SortableDraggable);
  });

  it('should return true for a SortableDroppable', () => {
    const sortable = createSortable('s1', 0);
    expect(isSortable(sortable.droppable)).toBe(true);
    expect(sortable.droppable).toBeInstanceOf(SortableDroppable);
  });

  it('should return false for a plain Draggable', () => {
    const draggable = createDraggable('d1');
    expect(isSortable(draggable)).toBe(false);
  });

  it('should return false for a plain Droppable', () => {
    const droppable = createDroppable('d1');
    expect(isSortable(droppable)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isSortable(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isSortableOperation
// ---------------------------------------------------------------------------

describe('isSortableOperation', () => {
  it('should return true when source and target are both sortable', () => {
    const s1 = createSortable('s1', 0);
    const s2 = createSortable('s2', 1);
    const op = mockOperation(s1.draggable, s2.droppable);
    expect(isSortableOperation(op)).toBe(true);
  });

  it('should return false when source is a plain Draggable', () => {
    const draggable = createDraggable('d1');
    const sortable = createSortable('s1', 0);
    const op = mockOperation(draggable, sortable.droppable);
    expect(isSortableOperation(op)).toBe(false);
  });

  it('should return false when target is a plain Droppable', () => {
    const sortable = createSortable('s1', 0);
    const droppable = createDroppable('d1');
    const op = mockOperation(sortable.draggable, droppable);
    expect(isSortableOperation(op)).toBe(false);
  });

  it('should return false when source is null', () => {
    const sortable = createSortable('s1', 0);
    const op = mockOperation(null, sortable.droppable);
    expect(isSortableOperation(op)).toBe(false);
  });

  it('should return false when target is null', () => {
    const sortable = createSortable('s1', 0);
    const op = mockOperation(sortable.draggable, null);
    expect(isSortableOperation(op)).toBe(false);
  });

  it('should return false when both are null', () => {
    const op = mockOperation(null, null);
    expect(isSortableOperation(op)).toBe(false);
  });

  it('should return false when both are plain (non-sortable)', () => {
    const draggable = createDraggable('d1');
    const droppable = createDroppable('d2');
    const op = mockOperation(draggable, droppable);
    expect(isSortableOperation(op)).toBe(false);
  });

  it('should narrow types to expose sortable properties on source', () => {
    const s1 = createSortable('s1', 2, 'groupA');
    const s2 = createSortable('s2', 5, 'groupA');
    const op = mockOperation(s1.draggable, s2.droppable);

    if (isSortableOperation(op)) {
      expect(op.source!.index).toBe(2);
      expect(op.source!.initialIndex).toBe(2);
      expect(op.source!.group).toBe('groupA');
      expect(op.source!.initialGroup).toBe('groupA');
      expect(op.target!.index).toBe(5);
      expect(op.target!.group).toBe('groupA');
    } else {
      throw new Error('Expected isSortableOperation to return true');
    }
  });
});
