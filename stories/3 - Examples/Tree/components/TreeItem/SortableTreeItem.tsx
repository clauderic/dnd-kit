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
      duration: 3000,
    },
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ? transition : undefined,
  };

  React.useEffect(() => {
    if (id !== 'About Us') {
      return;
    }

    if (transform) {
      console.log(id, transform, transition);
    } else {
      console.log(id, 'transform removed', transition);
    }
  }, [id, transform, transition]);

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
