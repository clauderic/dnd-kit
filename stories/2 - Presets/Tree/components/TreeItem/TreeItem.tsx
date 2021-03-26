import React, {forwardRef, HTMLAttributes} from 'react';
import classNames from 'classnames';

import {Handle, Remove} from '../../../../components';
import styles from './TreeItem.module.css';

export interface Props extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  depth: number;
  ghost?: boolean;
  handleProps?: any;
  step: number;
  value: string;
  onRemove?(): void;
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
      onRemove,
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
          <span className={styles.Text}>{value}</span>
          {!clone && !ghost && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);
