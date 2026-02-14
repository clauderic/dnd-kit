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

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(
  function Button({actions, children, shadow, ...props}, ref) {
    return (
      <button
        ref={ref}
        className="btn"
        data-shadow={shadow ? 'true' : undefined}
        {...props}
      >
        {children}
        {actions}
      </button>
    );
  }
);
