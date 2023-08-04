import React, {forwardRef, CSSProperties, Ref} from 'react';

import {classNames} from '../../utilities';

import styles from './Action.module.css';

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  light?: boolean;
  cursor?: CSSProperties['cursor'];
}

export const Action = forwardRef<HTMLButtonElement, Props>(
  ({className, cursor, style, light, ...props}, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={classNames(styles.Action, light && styles.light, className)}
        tabIndex={0}
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
