import React from 'react';

import {applyModifiers, Modifiers} from '../../modifiers';
import {useInitialValue} from '../../hooks/utilities';

import {AnimationManager, PositionedOverlay} from './components';
import type {PositionedOverlayProps} from './components';

import {useDropAnimation, useKey} from './hooks';
import type {DropAnimation} from './hooks';
import {
  useActiveDraggableContextStore,
  usePublicContextStore,
} from '../../store/new-store';

export interface Props
  extends Pick<
    PositionedOverlayProps,
    'adjustScale' | 'children' | 'className' | 'style' | 'transition'
  > {
  dropAnimation?: DropAnimation | null | undefined;
  modifiers?: Modifiers;
  wrapperElement?: keyof JSX.IntrinsicElements;
  zIndex?: number;
}

export const DragOverlay = React.memo(
  ({
    adjustScale = false,
    children,
    dropAnimation: dropAnimationConfig,
    style,
    transition,
    modifiers,
    wrapperElement = 'div',
    className,
    zIndex = 999,
  }: Props) => {
    const {
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggableNodes,
      droppableContainers,
      dragOverlay,
      over,
      measuringConfiguration,
      scrollableAncestors,
      scrollableAncestorRects,
      windowRect,
    } = usePublicContextStore();
    const transform = useActiveDraggableContextStore();
    const key = useKey(active?.id);
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
    const initialRect = useInitialValue(activeNodeRect);
    const dropAnimation = useDropAnimation({
      config: dropAnimationConfig,
      draggableNodes,
      droppableContainers,
      measuringConfiguration,
    });
    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref = initialRect ? dragOverlay.setRef : undefined;

    return (
      <AnimationManager animation={dropAnimation}>
        {active && key ? (
          <PositionedOverlay
            key={key}
            id={active.id}
            ref={ref}
            as={wrapperElement}
            activatorEvent={activatorEvent}
            adjustScale={adjustScale}
            className={className}
            transition={transition}
            rect={initialRect}
            style={{
              zIndex,
              ...style,
            }}
            transform={modifiedTransform}
          >
            {children}
          </PositionedOverlay>
        ) : null}
      </AnimationManager>
    );
  }
);
