import React, {forwardRef, HTMLAttributes} from 'react';
import classNames from 'classnames';

import styles from './Page.module.css';

export interface Props extends HTMLAttributes<HTMLLIElement> {
  active?: boolean;
  clone?: boolean;
  over?: boolean;
  id: string;
}

export const Page = forwardRef<HTMLLIElement, Props>(function Page(
  {id, active, clone, over, ...props},
  ref
) {
  return (
    <li
      ref={ref}
      className={classNames(
        styles.Page,
        active && styles.active,
        clone && styles.clone,
        over && styles.over
      )}
      {...props}
    >
      <span className={styles.PageNumber}>{id}</span>
    </li>
  );
});
