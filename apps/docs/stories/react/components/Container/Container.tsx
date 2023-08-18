import React, {forwardRef} from 'react';

import {classNames} from '../../../utilities';

import styles from './Container.module.css';

export interface Props {
  children: React.ReactNode;
  actions?: React.ReactNode;
  columns?: number;
  label?: string;
  scrollable?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      actions,
      children,
      columns = 1,
      label,
      style,
      scrollable,
      shadow,
      ...props
    }: Props,
    ref
  ) => {
    return (
      <div
        {...props}
        ref={ref}
        style={
          {
            ...style,
            '--columns': columns,
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
      >
        {label ? (
          <div className={styles.Header}>
            {label}
            {actions}
          </div>
        ) : null}
        <ul>{children}</ul>
      </div>
    );
  }
);
