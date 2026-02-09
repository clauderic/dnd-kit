import React, {forwardRef} from 'react';

export interface HandleProps extends React.HTMLAttributes<HTMLElement> {}

export const Handle = forwardRef<HTMLElement, HandleProps>(
  (props, ref) => {
    return React.createElement('handle-component', {ref, ...props});
  }
);
