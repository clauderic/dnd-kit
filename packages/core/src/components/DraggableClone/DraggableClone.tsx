import React, {forwardRef, useContext} from 'react';

import {CSS} from '@dnd-kit/utilities';

import {Context} from '../../store';
import {getEventCoordinates} from '../../utilities';
import {
  applyModifiers,
  Modifiers,
  restrictToWindowEdges,
} from '../../modifiers';
import {ActiveDraggableContext} from '../DndContext';

type TransitionGetter = (
  activatorEvent: Event | null
) => React.CSSProperties['transition'] | undefined;

export interface Props {
  children?: React.ReactNode;
  className?: string;
  wrapperElement?: keyof JSX.IntrinsicElements;
  transition?: string | TransitionGetter;
  translateModifiers?: Modifiers;
  adjustScale?: boolean;
  style?: React.CSSProperties;
}

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = activatorEvent instanceof KeyboardEvent;

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

export const DraggableClone = React.memo(
  ({
    adjustScale,
    children,
    transition = defaultTransition,
    translateModifiers,
    wrapperElement,
    className,
  }: Props) => {
    const {
      active,
      activeRect,
      activatorEvent,
      cloneNode,
      scrollingContainerRect,
    } = useContext(Context);
    const transform = useContext(ActiveDraggableContext);
    const modifiedTransform = applyModifiers(
      [
        restrictToWindowEdges,
        ...(translateModifiers ? translateModifiers : []),
      ],
      {
        transform,
        activeRect: cloneNode.clientRect,
        scrollingContainerRect,
      }
    );

    // TO-DO: Also probably need to account for clone container scroll delta
    // but only if the parent of the clone is not the document.body I think

    const isDragging = active !== null;
    const style: React.CSSProperties | undefined = activeRect
      ? {
          position: 'fixed',

          width: activeRect.width,
          height: activeRect.height,
          top: activeRect.top,
          left: activeRect.left,

          // TO-DO: Should this really be the default?
          zIndex: 9999,
          transform: CSS.Transform.toString(
            adjustScale
              ? modifiedTransform
              : {
                  ...modifiedTransform,
                  scaleX: 1,
                  scaleY: 1,
                }
          ),
          transformOrigin:
            adjustScale && activatorEvent && activeRect
              ? getRelativeTransformOrigin(
                  activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
                  activeRect
                )
              : undefined,
          transition:
            typeof transition === 'function'
              ? transition(activatorEvent)
              : transition,
        }
      : undefined;

    return (
      <Clone
        ref={cloneNode.setRef}
        attributes={
          isDragging
            ? {
                style,
                className,
              }
            : undefined
        }
        isDragging={isDragging}
        wrapperElement={wrapperElement}
      >
        {children}
      </Clone>
    );
  }
);

const Clone = forwardRef(
  (
    {
      attributes,
      children,
      isDragging,
      wrapperElement = 'div',
    }: {
      attributes?: {
        style: React.CSSProperties | undefined;
        className: string | undefined;
      };
      children: React.ReactNode | null;
      isDragging: boolean;
      wrapperElement: Props['wrapperElement'];
    },
    ref
  ) => {
    const shouldRender = isDragging;

    if (!shouldRender) {
      return null;
    }

    return React.createElement(
      wrapperElement,
      {
        ...attributes,
        ref,
      },
      children
    );
  }
);

function getRelativeTransformOrigin(
  event: MouseEvent | TouchEvent | KeyboardEvent,
  clientRect: ClientRect
) {
  if (event instanceof KeyboardEvent) {
    return '0 0';
  }

  const eventCoordinates = getEventCoordinates(event);
  const transformOrigin = {
    x: ((eventCoordinates.x - clientRect.left) / clientRect.width) * 100,
    y: ((eventCoordinates.y - clientRect.top) / clientRect.height) * 100,
  };

  return `${transformOrigin.x}% ${transformOrigin.y}%`;
}
