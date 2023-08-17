import React, {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

import {classNames} from '../../../utilities';

import styles from './Item.module.css';

export interface Props extends HTMLAttributes<HTMLElement> {
  actions?: React.ReactNode;
  shadow?: boolean;
  accentColor?: string;
}

export const Item = forwardRef<HTMLElement, PropsWithChildren<Props>>(
  function Button(
    {actions, accentColor, children, shadow, style, ...props},
    ref
  ) {
    const Element = actions ? 'div' : 'button';

    return (
      <Element
        {...props}
        className={classNames(
          styles.Item,
          shadow && styles.shadow,
          actions ? styles.withActions : undefined,
          accentColor ? styles.withBorder : undefined
        )}
        style={
          {
            ...style,
            '--accent-color': accentColor,
          } as CSSProperties
        }
        ref={ref as any}
      >
        {children}
        {actions}
      </Element>
    );
  }
);
