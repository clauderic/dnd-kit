import React from 'react';

import styles from './Board.module.css';

export interface Props {
  children: React.ReactNode;
  size: number;
}

export function Board({children, size}: Props) {
  return (
    <div
      className={styles.Board}
      style={{'--size': size} as React.CSSProperties}
    >
      {children}
    </div>
  );
}
