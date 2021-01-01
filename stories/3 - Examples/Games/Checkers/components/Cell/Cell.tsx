import React from 'react';
import classNames from 'classnames';
import {useDroppable} from '@dnd-kit/core';

import styles from './Cell.module.css';

export interface Props {
  children?: React.ReactElement | null;
  id: string;
  odd: boolean;
  size?: number;
  validDropLocation?: boolean;
  x: number;
  y: number;
}

export function Cell({children, validDropLocation, id, odd, x, y}: Props) {
  const {isOver, setNodeRef} = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={classNames(
        styles.Cell,
        validDropLocation && styles.highlight,
        odd ? styles.odd : styles.even,
        isOver && styles.over
      )}
      data-x={x}
      data-y={y}
    >
      {children}
    </div>
  );
}
