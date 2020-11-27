import React from 'react';

import styles from './GridContainer.module.css';

export interface Props {
  children: React.ReactNode;
  columns: number;
}

export function GridContainer({children, columns}: Props) {
  return (
    <ul
      className={styles.GridContainer}
      style={
        {
          '--col-count': columns,
        } as React.CSSProperties
      }
    >
      {children}
    </ul>
  );
}
