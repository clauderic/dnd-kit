import React, {forwardRef} from 'react';
import classNames from 'classnames';

import styles from './List.module.css';

export interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  horizontal?: boolean;
}

export const List = forwardRef<HTMLUListElement, Props>(
  ({children, horizontal, style}: Props, ref) => {
    return (
      <ul
        ref={ref}
        style={style}
        className={classNames(styles.List, horizontal && styles.horizontal)}
      >
        {children}
      </ul>
    );
  }
);
