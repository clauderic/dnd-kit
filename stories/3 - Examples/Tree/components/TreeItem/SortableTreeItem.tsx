import React, {CSSProperties} from 'react';
import {AnimateLayoutChanges, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem, Props as TreeItemProps} from './TreeItem';
import {iOS} from '../../utilities';

interface Props extends TreeItemProps {
  id: string;
}

const animateLayoutChanges: AnimateLayoutChanges = ({isSorting, wasSorting}) =>
  isSorting || wasSorting ? false : true;

export function SortableTreeItem({id, depth, ...props}: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    transition: {
      easing: 'linear',
      duration: 300,
    },
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ? transition : undefined,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
