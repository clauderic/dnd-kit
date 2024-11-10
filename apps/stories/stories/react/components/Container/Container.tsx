import React, {forwardRef} from 'react';

import {classNames} from '../../../utilities';

import styles from './Container.module.css';

export interface Props {
  children: React.ReactNode;
  accentColor?: string;
  actions?: React.ReactNode;
  columns?: number;
  label?: string;
  scrollable?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
  transitionId?: string;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      accentColor = 'transparent',
      actions,
      children,
      columns = 1,
      label,
      style,
      scrollable,
      shadow,
      transitionId,
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
            viewTransitionName: transitionId,
            '--columns': columns,
            '--accent-color': accentColor,
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
        <ul id={label}>{children}</ul>
      </div>
    );
  }
);
