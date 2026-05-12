import type {UniqueIdentifier} from '@dnd-kit/abstract';

import type {Sortable} from '../sortable.ts';

export type SortableInstances = Map<
  UniqueIdentifier | undefined,
  Set<Sortable>
>;
export type SortableIndices = Map<UniqueIdentifier, number>;

export function getSortableIndices(
  instances: SortableInstances
): SortableIndices {
  const sortableIndices: SortableIndices = new Map();

  for (const [, group] of instances) {
    for (const sortable of group) {
      sortableIndices.set(sortable.id, sortable.index);
    }
  }

  return sortableIndices;
}

export function hasChanged(
  snapshotIndices: SortableIndices,
  instances: SortableInstances,
  newInstances: SortableInstances
): boolean {
  for (const [group, sortables] of instances) {
    for (const sortable of sortables) {
      const index = snapshotIndices.get(sortable.id);

      if (
        sortable.index !== index ||
        sortable.group !== group ||
        !newInstances.get(group)?.has(sortable)
      ) {
        return true;
      }
    }
  }

  return false;
}
