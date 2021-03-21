import React, {forwardRef, HTMLAttributes} from 'react';
import classNames from 'classnames';

import styles from './Page.module.css';

export enum Position {
  Before = -1,
  After = 1,
}

export enum Layout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  Grid = 'grid',
}

export interface Props extends HTMLAttributes<HTMLLIElement> {
  active?: boolean;
  clone?: boolean;
  insertPosition?: Position;
  id: string;
  layout: Layout;
}

export const Page = forwardRef<HTMLLIElement, Props>(function Page(
  {id, active, clone, insertPosition, layout, ...props},
  ref
) {
  return (
    <li
      ref={ref}
      className={classNames(
        styles.Page,
        active && styles.active,
        clone && styles.clone,
        insertPosition === Position.Before && styles.insertBefore,
        insertPosition === Position.After && styles.insertAfter,
        layout === Layout.Vertical && styles.vertical
      )}
      {...props}
    >
      <span className={styles.PageNumber}>{id}</span>
    </li>
  );
});
