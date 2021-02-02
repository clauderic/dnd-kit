import React, {forwardRef, HTMLAttributes} from 'react';
import classNames from 'classnames';

import {Handle} from '../Handle';
import styles from './TreeItem.module.css';

export interface Props extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  depth: number;
  ghost?: boolean;
  handleProps?: any;
  step: number;
  value: string;
}

export const TreeItem = forwardRef<HTMLLIElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      ghost,
      handleProps,
      step,
      style,
      value,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={classNames(
          styles.TreeItem,
          clone && styles.clone,
          ghost && styles.ghost
        )}
        ref={ref}
        style={
          {
            '--spacing': `${step * depth}px`,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className={styles.Wrapper}>
          <Handle {...handleProps} />
          {value}
          {clone && childCount ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);
