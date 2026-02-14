import React, {forwardRef} from 'react';

export interface HandleProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: string;
}

export const Handle = forwardRef<HTMLButtonElement, HandleProps>(
  ({variant, ...props}, ref) => {
    return <button ref={ref} className="handle" {...props} />;
  }
);
