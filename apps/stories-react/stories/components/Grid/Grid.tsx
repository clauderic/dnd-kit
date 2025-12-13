import React, {type PropsWithChildren} from 'react';

import styles from './Grid.module.css';

export interface Props extends PropsWithChildren {
  size: number;
}

export function Grid({children, size}: Props) {
  return (
    <div
      className={styles.Grid}
      style={
        {
          '--grid-size': `${size}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
