import React, {forwardRef, useRef, useEffect, useLayoutEffect} from 'react';
import classNames from 'classnames';

import {combineRefs} from '../../utilities';
import {getSuitColor} from './utilities';

import styles from './PlayingCard.module.css';

export interface Props {
  value: string;
  index: number;
  transform: {
    x: number;
    y: number;
  } | null;
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
      ...props
    },
    ref
  ) => {
    const nodeRef = useRef<HTMLDivElement>();
    const prevDragging = useRef(Boolean(isDragging));
    const top = (index ?? 0) * 40;
    const prevTop = useRef<number | null>(null);

    useLayoutEffect(() => {
      if (!isSorting) {
        return;
      }

      if (prevTop.current !== null) {
        nodeRef.current?.animate(
          [
            {
              transform: `translate3d(0, ${
                prevTop.current - top
              }px, 0) ${baseTransform}`,
            },
            {transform: `translate3d(0, 0, 0) ${baseTransform} `},
          ],
          {
            ...baseAnimation,
            duration: 400,
          }
        );
      }

      prevTop.current = top;
    }, [top, isSorting]);

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
          } as React.CSSProperties
        }
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
              top,
              zIndex: undefined,
            } as React.CSSProperties
          }
          ref={combineRefs(ref, nodeRef)}
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
