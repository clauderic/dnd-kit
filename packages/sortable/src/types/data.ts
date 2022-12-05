import type {UniqueIdentifier} from '@schuchertmanagementberatung/dnd-kit-core';

export type SortableData = {
  sortable: {
    containerId: UniqueIdentifier;
    items: UniqueIdentifier[];
    index: number;
  };
};
