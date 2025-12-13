import React, {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';

export interface Props extends HTMLAttributes<HTMLElement> {
  actions?: React.ReactNode;
  accentColor?: string;
  shadow?: boolean;
  transitionId?: string;
}

export const Item = forwardRef<HTMLElement, PropsWithChildren<Props>>(
  function Button(
    {actions, accentColor, children, shadow, style, transitionId, ...props},
    ref
  ) {
    const Element = actions ? 'div' : 'button';

    return (
      <Element
        {...props}
        className={'Item'}
        style={
          {
            ...style,
            viewTransitionName: transitionId,
            '--accent-color': accentColor,
          } as CSSProperties
        }
        data-shadow={shadow}
        data-accent-color={accentColor}
        ref={ref as any}
      >
        {children}
        {actions}
      </Element>
    );
  }
);
