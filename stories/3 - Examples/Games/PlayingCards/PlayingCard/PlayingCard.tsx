import React, {forwardRef, useRef, useEffect} from 'react';
import classNames from 'classnames';

import {getSuitColor} from './utilities';

import styles from './PlayingCard.module.css';

export interface Props {
  value: string;
  index: number;
  transform: {
    x: number;
    y: number;
  } | null;
  transition: string;
  fadeIn: boolean;
  style?: React.CSSProperties;
  isPickedUp?: boolean;
  isDragging: boolean;
  isSorting: boolean;
  mountAnimation?: boolean;
}

export const PlayingCard = forwardRef<HTMLDivElement, Props>(
  (
    {
      value,
      isDragging,
      isSorting,
      mountAnimation,
      fadeIn,
      isPickedUp,
      style,
      index,
      transform,
      transition,
      ...props
    },
    ref
  ) => {
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const prevDragging = useRef(Boolean(isDragging));

    useEffect(() => {
      if (!isDragging && prevDragging.current) {
        nodeRef.current?.animate(
          dropAnimation.keyframes,
          dropAnimation.options
        );
      }

      if (prevDragging.current !== isDragging) {
        prevDragging.current = isDragging;
      }
    }, [isDragging]);

    return (
      <div
        className={classNames(styles.Wrapper, transform && styles.sorting)}
        style={
          {
            '--translate-y': transform ? `${transform.y}px` : undefined,
            '--index': index,
            zIndex: style?.zIndex,
            transition,
          } as React.CSSProperties
        }
        ref={ref}
      >
        <div
          className={classNames(
            styles.PlayingCard,
            mountAnimation && styles.mountAnimation,
            isPickedUp && styles.pickedUp,
            isDragging && styles.dragging,
            fadeIn && styles.fadeIn
          )}
          style={
            {
              ...style,
              '--scale': isPickedUp ? 1.075 : undefined,
              color: getSuitColor(value),
              zIndex: undefined,
            } as React.CSSProperties
          }
          ref={nodeRef}
          tabIndex={0}
          {...props}
        >
          <sup>{value}</sup>
          <strong>{value[value.length - 1]}</strong>
          <sub>{value}</sub>
        </div>
      </div>
    );
  }
);

const baseTransform = 'rotateX(60deg) rotateZ(33deg)';
const baseAnimation = {
  iterations: 1,
  easing: 'ease',
};
const dropAnimation = {
  keyframes: [
    {
      transform: `${baseTransform} translate3d(15px, 5px, 0)`,
      opacity: 0.7,
    },
    {
      transform: `${baseTransform} translate3d(0, 0, 0)`,
      opacity: 1,
    },
  ],
  options: {
    ...baseAnimation,
    duration: 600,
  },
};
