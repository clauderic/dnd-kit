import React, { CSSProperties } from 'react';
import type { UniqueIdentifier } from '@schuchertmanagementberatung/dnd-kit-core';
import {
  AnimateLayoutChanges,
  useSortable,
} from '@schuchertmanagementberatung/dnd-kit-sortable';
import { CSS } from '@schuchertmanagementberatung/dnd-kit-utilities';

import { TreeItem, Props as TreeItemProps } from './TreeItem';
import { iOS } from '../../utilities';

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  wasDragging,
  isDragging,
}) => (isDragging || wasDragging ? false : true);

export function SortableTreeItem({ id, depth, ...props }: Props) {
  const {
    attributes,
    isDragging,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isDragging}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
