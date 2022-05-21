import React, {forwardRef} from 'react';
import {CSS, isKeyboardEvent} from '@dnd-kit/utilities';

import type {Transform} from '@dnd-kit/utilities';

import {getRelativeTransformOrigin} from '../../../../utilities';
import type {ClientRect, UniqueIdentifier} from '../../../../types';

type TransitionGetter = (
  activatorEvent: Event | null
) => React.CSSProperties['transition'] | undefined;

export interface Props {
  as: keyof JSX.IntrinsicElements;
  activatorEvent: Event | null;
  adjustScale?: boolean;
  children?: React.ReactNode;
  className?: string;
  id: UniqueIdentifier;
  rect: ClientRect | null;
  style?: React.CSSProperties;
  transition?: string | TransitionGetter;
  transform: Transform;
}

const baseStyles: React.CSSProperties = {
  position: 'fixed',
  touchAction: 'none',
};

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

export const PositionedOverlay = forwardRef<HTMLElement, Props>(
  (
    {
      as,
      activatorEvent,
      adjustScale,
      children,
      className,
      rect,
      style,
      transform,
      transition = defaultTransition,
    },
    ref
  ) => {
    if (!rect) {
      return null;
    }

    const scaleAdjustedTransform = adjustScale
      ? transform
      : {
          ...transform,
          scaleX: 1,
          scaleY: 1,
        };
    const styles: React.CSSProperties | undefined = {
      ...baseStyles,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      transform: CSS.Transform.toString(scaleAdjustedTransform),
      transformOrigin:
        adjustScale && activatorEvent
          ? getRelativeTransformOrigin(
              activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
              rect
            )
          : undefined,
      transition:
        typeof transition === 'function'
          ? transition(activatorEvent)
          : transition,
      ...style,
    };

    return React.createElement(
      as,
      {
        className,
        style: styles,
        ref,
      },
      children
    );
  }
);
