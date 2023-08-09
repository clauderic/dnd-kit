import React, {
  forwardRef,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

import {classNames} from '../../../utilities';

import styles from './Button.module.css';

export interface Props extends HTMLAttributes<HTMLElement> {
  actions?: React.ReactNode;
  shadow?: boolean;
}

export const Button = forwardRef<HTMLElement, PropsWithChildren<Props>>(
  function Button({actions, children, shadow, ...props}, ref) {
    const Element = actions ? 'div' : 'button';

    return (
      <Element
        {...props}
        className={classNames(
          styles.Button,
          shadow && styles.shadow,
          actions ? styles.hasActions : undefined
        )}
        ref={ref as any}
      >
        {children}
        {actions}
      </Element>
    );
  }
);
