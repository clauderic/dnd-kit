import type {MutableRefObject} from 'react';

export interface TreeItem {
  id: string;
  children: TreeItem[];
  collapsed?: boolean;
  subListTitle?: boolean
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: null | string;
  depth: number;
  index: number;
  subListTitle?: boolean
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
