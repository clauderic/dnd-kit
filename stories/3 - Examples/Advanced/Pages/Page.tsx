import React, {forwardRef, HTMLAttributes} from 'react';
import classNames from 'classnames';

import {removeIcon} from './icons';
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

export interface Props extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  clone?: boolean;
  insertPosition?: Position;
  id: string;
  index?: number;
  layout: Layout;
  onRemove?(): void;
}

export const Page = forwardRef<HTMLButtonElement, Props>(function Page(
  {id, index, active, clone, insertPosition, layout, onRemove, style, ...props},
  ref
) {
  return (
    <li
      className={classNames(
        styles.Wrapper,
        active && styles.active,
        clone && styles.clone,
        insertPosition === Position.Before && styles.insertBefore,
        insertPosition === Position.After && styles.insertAfter,
        layout === Layout.Vertical && styles.vertical
      )}
      style={style}
    >
      <button ref={ref} className={styles.Page} data-id={id} {...props} />
      {!active && onRemove ? (
        <button className={styles.Remove} onClick={onRemove}>
          {removeIcon}
        </button>
      ) : null}
      {index != null ? (
        <span className={styles.PageNumber}>{index}</span>
      ) : null}
    </li>
  );
});
