import type {UniqueIdentifier} from '@dnd-kit/core';

export type SortableData = {
  sortable: {
    containerId: UniqueIdentifier;
    items: UniqueIdentifier[];
    index: number;
  };
};
