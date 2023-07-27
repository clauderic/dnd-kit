import React, {
  forwardRef,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

import {classNames} from '../../utilities';

import styles from './Button.module.css';

export interface Props extends HTMLAttributes<HTMLButtonElement> {
  shadow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(
  function Button({children, shadow, ...props}, ref) {
    return (
      <button
        {...props}
        className={classNames(styles.Button, shadow && styles.shadow)}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);
