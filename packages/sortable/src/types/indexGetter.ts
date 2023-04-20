import type { UniqueIdentifier } from '@schuchertmanagementberatung/dnd-kit-core';

export interface NewIndexGetterArguments {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  activeIndex: number;
  overIndex: number;
}

export type NewIndexGetter = (args: NewIndexGetterArguments) => number;
