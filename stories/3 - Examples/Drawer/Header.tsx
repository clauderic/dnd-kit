import React, {forwardRef} from 'react';

import styles from './Drawer.module.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const Header = forwardRef<HTMLDivElement, Props>(function Header(
  {children, ...props},
  ref
) {
  return (
    <div className={styles.Header} {...props} ref={ref}>
      {children}
    </div>
  );
});
