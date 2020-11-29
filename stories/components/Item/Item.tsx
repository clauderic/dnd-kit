import React, {useEffect} from 'react';
import classNames from 'classnames';
import {DraggableSyntheticListeners} from '@dnd-kit/core';
import {Transform} from '@dnd-kit/utilities';

import {Handle} from './components';

import styles from './Item.module.css';

export interface Props {
  clone?: boolean;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  renderItem?(args: {
    clone: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLLIElement>;
    style: React.CSSProperties | undefined;
    transform: Props['transform'];
    value: Props['value'];
  }): React.ReactElement;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        clone,
        dragging,
        disabled,
        fadeIn,
        handle,
        height,
        index,
        listeners,
        renderItem,
        sorting,
        style,
        transform,
        value,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!clone) {
          return;
        }

        document.body.style.cursor = 'grabbing';

        return () => {
          document.body.style.cursor = '';
        };
      }, [clone]);

      return renderItem ? (
        renderItem({
          clone: Boolean(clone),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          value,
        })
      ) : (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            clone && styles.clone
          )}
          style={
            {
              ...wrapperStyle,
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              '--index': index,
            } as React.CSSProperties
          }
          ref={ref}
        >
          <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              handle && styles.withHandle,
              clone && styles.clone,
              disabled && styles.disabled
            )}
            tabIndex={!handle ? 1 : undefined}
            style={style}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
          >
            {value}
            {handle ? <Handle {...listeners} /> : null}
          </div>
        </li>
      );
    }
  )
);
