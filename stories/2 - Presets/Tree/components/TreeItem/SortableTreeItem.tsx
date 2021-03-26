import React, {CSSProperties} from 'react';
import {AnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem, Props as TreeItemProps} from './TreeItem';

interface Props extends TreeItemProps {
  id: string;
}

const animateLayoutChanges: AnimateLayoutChanges = ({isSorting, wasSorting}) =>
  isSorting || wasSorting ? false : true;

export function SortableTreeItem({id, depth, ...props}: Props) {
  const {
    isDragging,
    attributes,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({id, animateLayoutChanges});
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
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
