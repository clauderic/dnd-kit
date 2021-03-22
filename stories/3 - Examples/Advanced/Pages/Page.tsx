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

export interface Props extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  clone?: boolean;
  insertPosition?: Position;
  id: string;
  index?: number;
  layout: Layout;
  onRemove?(): void;
}

export const Page = forwardRef<HTMLDivElement, Props>(function Page(
  {id, index, active, clone, insertPosition, layout, onRemove, ...props},
  ref
) {
  return (
    <div className={styles.Wrapper}>
      <div
        ref={ref}
        className={classNames(
          styles.Page,
          active && styles.active,
          clone && styles.clone,
          insertPosition === Position.Before && styles.insertBefore,
          insertPosition === Position.After && styles.insertAfter,
          layout === Layout.Vertical && styles.vertical
        )}
        data-id={id}
        {...props}
      >
        {index != null ? (
          <span className={styles.PageNumber}>{index}</span>
        ) : null}
        {onRemove ? (
          <span className={styles.Remove} onClick={onRemove}>
            {trashIcon}
          </span>
        ) : null}
      </div>
    </div>
  );
});

const trashIcon = (
  <svg
    width="18"
    viewBox="0 0 28 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8 1.99791V4.00209C8 3.99991 8.00009 4 7.99406 4H20.0059C20.0009 4 20 4.00093 20 4.00209V1.99791C20 2.00009 19.9999 2 20.0059 2H7.99406C7.99908 2 8 1.99907 8 1.99791ZM1.99826 6H0V4H6V1.99791C6 0.894496 6.89451 0 7.99406 0H20.0059C21.1072 0 22 0.89826 22 1.99791V4H28V6H26.0017L25.9983 6.08326L25.04 29.0826C24.9724 30.703 23.6307 32 22.0066 32H5.9934C4.36907 32 3.02758 30.7036 2.96004 29.0826L2.00173 6.08326L1.99826 6ZM4 6L4.9583 28.9993C4.98136 29.5525 5.44476 30 5.9934 30H22.0066C22.5551 30 23.0187 29.552 23.0417 28.9993L24 6H4ZM17.0072 10V26H19.0072V10H17.0072ZM13 10V26H15V10H13ZM8.9928 10.0159V26.0159H10.9928V10.0159H8.9928Z"
    />
  </svg>
);
