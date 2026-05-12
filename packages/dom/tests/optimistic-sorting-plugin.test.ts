import {describe, expect, it} from 'bun:test';

import type {Sortable} from '@dnd-kit/dom/sortable';

import {
  getSortableIndices,
  hasChanged,
} from '../src/sortable/plugins/OptimisticSortingPlugin.helpers.ts';

// The helpers only read id/index/group, so a duck-typed fake avoids both the
// real Sortable constructor (which needs a DragDropManager) and the circular
// import between sortable.ts and OptimisticSortingPlugin.ts.
function createSortable(
  id: string | number,
  index: number,
  group?: string
): Sortable {
  return {id, index, group} as unknown as Sortable;
}

function buildInstances(sortables: Sortable[]) {
  const instances = new Map<string | number | undefined, Set<Sortable>>();
  for (const sortable of sortables) {
    let set = instances.get(sortable.group);
    if (!set) {
      set = new Set();
      instances.set(sortable.group, set);
    }
    set.add(sortable);
  }
  return instances;
}

describe('hasChanged', () => {
  it('returns false when nothing changed', () => {
    const a = createSortable('a', 0);
    const b = createSortable('b', 1);
    const c = createSortable('c', 2);
    const instances = buildInstances([a, b, c]);
    const snapshot = getSortableIndices(instances);

    expect(hasChanged(snapshot, instances, instances)).toBe(false);
  });

  it('returns false when indices are non-contiguous and unchanged', () => {
    // Regression: previously the check used position-in-set rather than the
    // sortable's actual index, which broke when indices had gaps.
    const a = createSortable('a', 0);
    const b = createSortable('b', 2);
    const c = createSortable('c', 5);
    const instances = buildInstances([a, b, c]);
    const snapshot = getSortableIndices(instances);

    expect(hasChanged(snapshot, instances, instances)).toBe(false);
  });

  it('returns true when a sortable index changes after the snapshot', () => {
    const a = createSortable('a', 0);
    const b = createSortable('b', 2);
    const c = createSortable('c', 5);
    const instances = buildInstances([a, b, c]);
    const snapshot = getSortableIndices(instances);

    (b as {index: number}).index = 3;

    expect(hasChanged(snapshot, instances, instances)).toBe(true);
  });

  it('returns true when a sortable group changes after the snapshot', () => {
    const a = createSortable('a', 0, 'g1');
    const b = createSortable('b', 1, 'g1');
    const instances = buildInstances([a, b]);
    const snapshot = getSortableIndices(instances);

    (b as {group: string}).group = 'g2';
    const newInstances = buildInstances([a, b]);

    expect(hasChanged(snapshot, instances, newInstances)).toBe(true);
  });

  it('returns true when a sortable is missing from newInstances', () => {
    const a = createSortable('a', 0);
    const b = createSortable('b', 1);
    const instances = buildInstances([a, b]);
    const snapshot = getSortableIndices(instances);
    const newInstances = buildInstances([a]);

    expect(hasChanged(snapshot, instances, newInstances)).toBe(true);
  });
});
