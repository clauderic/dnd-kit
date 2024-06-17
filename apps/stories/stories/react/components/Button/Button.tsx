import React, {
  forwardRef,
  Fragment,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

export interface Props extends HTMLAttributes<HTMLElement> {
  actions?: React.ReactNode;
  shadow?: boolean;
}

export const Button = forwardRef<HTMLElement, PropsWithChildren<Props>>(
  function Button({actions, children, shadow, ...props}, ref) {
    return React.createElement(
      'button-component',
      {
        ref,
        'data-shadow': shadow,
        ...props,
      },
      <Fragment>
        {children}
        {actions}
      </Fragment>
    );
  }
);
