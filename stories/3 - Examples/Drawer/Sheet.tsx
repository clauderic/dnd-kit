import React from 'react';
import classNames from 'classnames';
import {useDraggable} from '@dnd-kit/core';

import {Header} from './Header';
import {MAX_DRAWER_HEIGHT_PERCENT} from './constants';

import styles from './Drawer.module.css';

interface Props {
  children: React.ReactNode;
  expanded?: boolean;
  header: React.ReactNode;
}

export function Sheet({children, expanded, header}: Props) {
  const {attributes, isDragging, listeners, transform, setNodeRef} =
    useDraggable({
      id: 'header',
    });

  return (
    <div
      className={classNames(styles.Sheet, {
        [styles.dragging]: isDragging,
        [styles.expanded]: expanded,
      })}
      style={
        {
          '--max-height': `${MAX_DRAWER_HEIGHT_PERCENT * 100}vh`,
          '--transform': transform ? `${transform.y}px` : undefined,
        } as React.CSSProperties
      }
    >
      <Header ref={setNodeRef} {...attributes} {...listeners}>
        {header}
      </Header>
      <div className={styles.Content}>{children}</div>
    </div>
  );
}
