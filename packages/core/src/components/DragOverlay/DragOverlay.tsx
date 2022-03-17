import React, {useContext, useEffect, useRef} from 'react';
import {CSS, isKeyboardEvent, Transform, useLazyMemo} from '@dnd-kit/utilities';

import {InternalContext, defaultInternalContext} from '../../store';
import {getRelativeTransformOrigin} from '../../utilities';
import {applyModifiers, Modifiers} from '../../modifiers';
import {ActiveDraggableContext} from '../DndContext';
import {useDndContext} from '../../hooks';
import type {ClientRect} from '../../types';
import {useDropAnimation, defaultDropAnimation, DropAnimation} from './hooks';

type TransitionGetter = (
  activatorEvent: Event | null
) => React.CSSProperties['transition'] | undefined;

export interface Props {
  adjustScale?: boolean;
  children?: React.ReactNode;
  className?: string;
  dropAnimation?: DropAnimation | null | undefined;
  style?: React.CSSProperties;
  transition?: string | TransitionGetter;
  modifiers?: Modifiers;
  wrapperElement?: keyof JSX.IntrinsicElements;
  zIndex?: number;
}

const defaultTransform: Transform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
};

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

export const DragOverlay = React.memo(
  ({
    adjustScale = false,
    children,
    dropAnimation = defaultDropAnimation,
    style: styleProp,
    transition = defaultTransition,
    modifiers,
    wrapperElement = 'div',
    className,
    zIndex = 999,
  }: Props) => {
    const {
      active,
      activeNodeRect,
      containerNodeRect,
      draggableNodes,
      activatorEvent,
      over,
      dragOverlay,
      scrollableAncestors,
      scrollableAncestorRects,
      windowRect,
    } = useDndContext();
    const transform = useContext(ActiveDraggableContext);
    const modifiedTransform = applyModifiers(modifiers, {
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggingNodeRect: dragOverlay.rect,
      over,
      overlayNodeRect: dragOverlay.rect,
      scrollableAncestors,
      scrollableAncestorRects,
      transform,
      windowRect,
    });
    const isDragging = active !== null;
    const finalTransform = adjustScale
      ? modifiedTransform
      : {
          ...modifiedTransform,
          scaleX: 1,
          scaleY: 1,
        };

    const initialRect = useLazyMemo<ClientRect | null>(
      (previousValue) => {
        if (isDragging) {
          if (previousValue) {
            return previousValue;
          }

          if (!activeNodeRect) {
            return null;
          }

          return {
            ...activeNodeRect,
          };
        }

        return null;
      },
      [isDragging, activeNodeRect]
    );

    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref = initialRect ? dragOverlay.setRef : undefined;

    const style: React.CSSProperties | undefined = initialRect
      ? {
          position: 'fixed',
          width: initialRect.width,
          height: initialRect.height,
          top: initialRect.top,
          left: initialRect.left,
          zIndex,
          transform: CSS.Transform.toString(finalTransform),
          touchAction: 'none',
          transformOrigin:
            adjustScale && activatorEvent
              ? getRelativeTransformOrigin(
                  activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
                  initialRect
                )
              : undefined,
          transition:
            typeof transition === 'function'
              ? transition(activatorEvent)
              : transition,
          ...styleProp,
        }
      : undefined;
    const attributes = isDragging
      ? {
          style,
          children,
          className,
          transform: finalTransform,
        }
      : undefined;
    const attributesSnapshot = useRef(attributes);
    const derivedAttributes = attributes ?? attributesSnapshot.current;
    const {children: finalChildren, transform: _, ...otherAttributes} =
      derivedAttributes ?? {};
    const prevActiveId = useRef(active?.id ?? null);
    const dropAnimationComplete = useDropAnimation({
      animate: Boolean(dropAnimation && prevActiveId.current && !active),
      adjustScale,
      activeId: prevActiveId.current,
      draggableNodes,
      duration: dropAnimation?.duration,
      easing: dropAnimation?.easing,
      dragSourceOpacity: dropAnimation?.dragSourceOpacity,
      node: dragOverlay.nodeRef.current,
      transform: attributesSnapshot.current?.transform,
    });
    const shouldRender = Boolean(
      finalChildren && (children || (dropAnimation && !dropAnimationComplete))
    );

    useEffect(() => {
      if (active?.id !== prevActiveId.current) {
        prevActiveId.current = active?.id ?? null;
      }

      if (active && attributesSnapshot.current !== attributes) {
        attributesSnapshot.current = attributes;
      }
    }, [active, attributes]);

    useEffect(() => {
      if (dropAnimationComplete) {
        attributesSnapshot.current = undefined;
      }
    }, [dropAnimationComplete]);

    if (!shouldRender) {
      return null;
    }

    return (
      <InternalContext.Provider value={defaultInternalContext}>
        <ActiveDraggableContext.Provider value={defaultTransform}>
          {React.createElement(
            wrapperElement,
            {
              ...otherAttributes,
              ref,
            },
            finalChildren
          )}
        </ActiveDraggableContext.Provider>
      </InternalContext.Provider>
    );
  }
);
