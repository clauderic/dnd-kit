import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem, Props as TreeItemProps} from './TreeItem';

interface Props extends TreeItemProps {
  id: string;
  items: any;
}

export function SortableTreeItem({id, items, depth, ...props}: Props) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
