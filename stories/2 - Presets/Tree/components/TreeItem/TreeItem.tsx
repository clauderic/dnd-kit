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
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
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
      wrapperRef,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost
        )}
        ref={wrapperRef}
        style={
          {
            ...style,
            '--spacing': `${step * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className={styles.TreeItem} ref={ref}>
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
