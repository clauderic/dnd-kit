import React, {useContext} from 'react';

import {applyModifiers, Modifiers} from '../../modifiers';
import {ActiveDraggableContext} from '../DndContext';
import {useDndContext} from '../../hooks';
import {useInitialValue} from '../../hooks/utilities';

import {
  AnimationManager,
  NullifiedContextProvider,
  PositionedOverlay,
} from './components';
import type {PositionedOverlayProps} from './components';

import {useDropAnimation, useKey} from './hooks';
import type {DropAnimation} from './hooks';

export interface Props<DraggableData, DroppableData>
  extends Pick<
    PositionedOverlayProps,
    'adjustScale' | 'children' | 'className' | 'style' | 'transition'
  > {
  dropAnimation?:
    | DropAnimation<DraggableData, DroppableData>
    | null
    | undefined;
  modifiers?: Modifiers<DraggableData, DroppableData>;
  wrapperElement?: keyof JSX.IntrinsicElements;
  zIndex?: number;
}

export const DragOverlay = React.memo(
  <DraggableData, DroppableData>({
    adjustScale = false,
    children,
    dropAnimation: dropAnimationConfig,
    style,
    transition,
    modifiers,
    wrapperElement = 'div',
    className,
    zIndex = 999,
  }: Props<DraggableData, DroppableData>) => {
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
    } = useDndContext<DraggableData, DroppableData>();
    const transform = useContext(ActiveDraggableContext);
    const key = useKey(active?.id);
    const modifiedTransform = applyModifiers<DraggableData, DroppableData>(
      modifiers,
      {
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
      }
    );
    const initialRect = useInitialValue(activeNodeRect);
    const dropAnimation = useDropAnimation<DraggableData, DroppableData>({
      config: dropAnimationConfig,
      draggableNodes,
      droppableContainers,
      measuringConfiguration,
    });
    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref = initialRect ? dragOverlay.setRef : undefined;

    return (
      <NullifiedContextProvider>
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
      </NullifiedContextProvider>
    );
  }
);
