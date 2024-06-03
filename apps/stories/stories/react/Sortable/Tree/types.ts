export interface Item {
  id: string;
  children: Item[];
  collapsed?: boolean;
}

export interface FlattenedItem extends Item {
  parentId: string | null;
  depth: number;
  index: number;
}
