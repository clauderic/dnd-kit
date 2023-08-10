import React, {forwardRef, CSSProperties, Ref} from 'react';

import {classNames} from '../../../utilities';

import styles from './Action.module.css';

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark';
  cursor?: CSSProperties['cursor'];
}

export const Action = forwardRef<HTMLButtonElement, Props>(
  ({className, cursor, style, variant = 'light', ...props}, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={classNames(styles.Action, styles[variant], className)}
        style={
          {
            ...style,
            cursor,
          } as CSSProperties
        }
      />
    );
  }
);
