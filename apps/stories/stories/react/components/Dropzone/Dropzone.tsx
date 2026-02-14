import React, {forwardRef} from 'react';

interface Props {
  children: React.ReactNode;
  highlight?: boolean;
}

export const Dropzone = forwardRef<HTMLDivElement, Props>(function Dropzone(
  {children, highlight},
  ref
) {
  return (
    <div ref={ref} className={highlight ? 'droppable active' : 'droppable'}>
      {children}
    </div>
  );
});
