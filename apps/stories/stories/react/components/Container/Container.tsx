import React, {forwardRef} from 'react';

export interface Props {
  children: React.ReactNode;
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
    return React.createElement(
      'container-component',
      {
        ...props,
        ref,
        style: {
          ...style,
          viewTransitionName: transitionId,
          '--columns': columns,
        } as React.CSSProperties,
        'data-shadow': shadow ? 'true' : undefined,
        'data-scrollable': scrollable ? 'true' : undefined,
      },
      <>
        {label ? (
          <div className="Header">
            {label}
            {actions}
          </div>
        ) : null}
        <ul id={label}>{children}</ul>
      </>
    );
  }
);
