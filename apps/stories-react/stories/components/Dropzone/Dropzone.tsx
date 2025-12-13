import React, {forwardRef} from 'react';

interface Props {
  children: React.ReactNode;
  highlight?: boolean;
}

export const Dropzone = forwardRef<HTMLDivElement, Props>(function Dropzone(
  {children, highlight},
  ref
) {
  return React.createElement(
    'dropzone-component',
    {
      ref,
      'data-highlight': String(highlight),
    },
    children
  );
});
