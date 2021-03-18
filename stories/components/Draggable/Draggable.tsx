import React, {forwardRef} from 'react';
import classNames from 'classnames';
import type {DraggableSyntheticListeners, Translate} from '@dnd-kit/core';

import {Handle} from '../Item/components/Handle';

import {
  draggable,
  draggableHorizontal,
  draggableVertical,
} from './draggable-svg';
import styles from './Draggable.module.css';

export enum Axis {
  All,
  Vertical,
  Horizontal,
}

interface Props {
  axis?: Axis;
  dragOverlay?: boolean;
  dragging?: boolean;
  handle?: boolean;
  label?: string;
  listeners?: DraggableSyntheticListeners;
  style?: React.CSSProperties;
  translate?: Translate;
}

export const Draggable = forwardRef<HTMLButtonElement, Props>(
  function Draggable(
    {
      axis,
      dragOverlay,
      dragging,
      handle,
      label,
      listeners,
      translate,
      ...props
    },
    ref
  ) {
    return (
      <div
        className={classNames(
          styles.Draggable,
          dragOverlay && styles.dragOverlay,
          dragging && styles.dragging,
          handle && styles.handle
        )}
        style={
          {
            '--translate-x': `${translate?.x ?? 0}px`,
            '--translate-y': `${translate?.y ?? 0}px`,
          } as React.CSSProperties
        }
      >
        <button
          ref={ref}
          {...props}
          aria-label="Draggable"
          data-cypress="draggable-item"
          {...(handle ? {} : listeners)}
          tabIndex={handle ? -1 : undefined}
        >
          {axis === Axis.Vertical
            ? draggableVertical
            : axis === Axis.Horizontal
            ? draggableHorizontal
            : draggable}
          {handle ? <Handle {...(handle ? listeners : {})} /> : null}
        </button>
        {label ? <label>{label}</label> : null}
      </div>
    );
  }
);
