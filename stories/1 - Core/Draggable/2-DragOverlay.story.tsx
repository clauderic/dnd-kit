import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  useDropAnimation,
  defaultDropAnimation,
  Modifiers,
  useDraggable,
  Translate,
  getTransformAgnosticClientRect,
  getMeasurableNode,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {CSS, useIsomorphicLayoutEffect} from '@dnd-kit/utilities';

import {Axis, Draggable, Wrapper} from '../../components';

export default {
  title: `Core/Draggable/Components/\u003CDragOverlay\u003E`,
};

interface Props {
  axis?: Axis;
  dragOverlayModifiers?: Modifiers;
  dropAnimation?: DropAnimation | null;
  useCustomDropAnimation?: typeof useDropAnimation;
  handle?: boolean;
  label?: string;
  modifiers?: Modifiers;
  style?: React.CSSProperties;
}

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

function DragOverlayExample({
  axis,
  dragOverlayModifiers,
  dropAnimation = defaultDropAnimationConfig,
  useCustomDropAnimation,
  handle,
  label,
  modifiers,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DndContext
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragEnd}
    >
      <Wrapper>
        <DraggableItem axis={axis} handle={handle} label={label} />
      </Wrapper>
      {createPortal(
        <DragOverlay
          modifiers={dragOverlayModifiers}
          dropAnimation={dropAnimation}
          useCustomDropAnimation={useCustomDropAnimation}
        >
          {isDragging ? <Draggable axis={axis} dragging dragOverlay /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }
}

interface DraggableItemProps {
  axis: Axis | undefined;
  label?: string;
  handle?: boolean;
  translate?: Translate;
}

function DraggableItem({axis, label}: DraggableItemProps) {
  const {setNodeRef, listeners, isDragging} = useDraggable({
    id: 'draggable-item',
  });

  return (
    <Draggable
      ref={setNodeRef}
      label={label}
      axis={axis}
      dragging={isDragging}
      listeners={listeners}
      style={{
        opacity: isDragging ? 0.5 : undefined,
      }}
    />
  );
}

export const BasicSetup = () => (
  <DragOverlayExample label="Drag me to see the <DragOverlay>" />
);
export const DisableDropAnimation = () => (
  <DragOverlayExample label="Drop animation disabled" dropAnimation={null} />
);
export const HorizontalAxis = () => (
  <DragOverlayExample
    label="I'm only draggable horizontally"
    axis={Axis.Horizontal}
    modifiers={[restrictToHorizontalAxis]}
  />
);
export const VerticalAxis = () => (
  <DragOverlayExample
    label="I'm only draggable vertically"
    axis={Axis.Vertical}
    modifiers={[restrictToVerticalAxis]}
  />
);
export const RestrictToWindowEdges = () => (
  <DragOverlayExample
    label="I'm only draggable within the window bounds"
    modifiers={[restrictToWindowEdges]}
  />
);

export const OverrideDropAnimation = () => (
  <DragOverlayExample
    label="I will animate to the center of the window when dropped"
    modifiers={[restrictToWindowEdges]}
    useCustomDropAnimation={useDropAnimationCenterWindow}
  />
);

const useDropAnimationCenterWindow: typeof useDropAnimation = ({
  animate,
  adjustScale,
  activeId,
  draggableNodes,
  duration,
  dragSourceOpacity,
  easing,
  node,
  transform,
}) => {
  const [dropAnimationComplete, setDropAnimationComplete] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!animate || !activeId || !easing || !duration) {
      if (animate) {
        setDropAnimationComplete(true);
      }

      return;
    }

    const finalNode = draggableNodes[activeId]?.node.current;

    if (transform && node && finalNode && finalNode.parentNode !== null) {
      const fromNode = getMeasurableNode(node);

      if (fromNode) {
        const from = fromNode.getBoundingClientRect();
        const finalNodeRect = getTransformAgnosticClientRect(finalNode);
        // Animate to the center of the window instead of the finalNode
        const to = {
          ...finalNodeRect,
          left: window.innerWidth / 2 - node.offsetWidth / 2,
          top: window.innerHeight / 2 - node.offsetHeight / 2,
        };

        const delta = {
          x: from.left - to.left,
          y: from.top - to.top,
        };

        if (Math.abs(delta.x) || Math.abs(delta.y)) {
          const scaleDelta = {
            scaleX: adjustScale
              ? (to.width * transform.scaleX) / from.width
              : 1,
            scaleY: adjustScale
              ? (to.height * transform.scaleY) / from.height
              : 1,
          };
          const finalTransform = CSS.Transform.toString({
            x: transform.x - delta.x,
            y: transform.y - delta.y,
            ...scaleDelta,
          });
          const originalOpacity = finalNode.style.opacity;

          if (dragSourceOpacity != null) {
            finalNode.style.opacity = `${dragSourceOpacity}`;
          }

          const nodeAnimation = node.animate(
            [
              {
                opacity: 1,
                transform: CSS.Transform.toString(transform),
                transformOrigin: 'center',
              },
              {
                opacity: 1,
                offset: 0.7,
              },
              {
                transform: finalTransform,
                opacity: 0,
              },
            ],
            {
              easing,
              duration,
              fill: 'both',
            }
          );

          nodeAnimation.onfinish = () => {
            node.style.display = 'none';
            setDropAnimationComplete(true);
            if (finalNode && dragSourceOpacity != null) {
              // Fade in the drag source
              const finalNodeAnimation = finalNode.animate(
                [{opacity: dragSourceOpacity}, {opacity: originalOpacity || 1}],
                {
                  duration: 150,
                }
              );

              finalNodeAnimation.onfinish = () => {
                finalNode.style.opacity = originalOpacity;
              };
            }
          };
          return;
        }
      }
    }

    setDropAnimationComplete(true);
  }, [
    animate,
    activeId,
    adjustScale,
    draggableNodes,
    duration,
    easing,
    dragSourceOpacity,
    node,
    transform,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (dropAnimationComplete) {
      setDropAnimationComplete(false);
    }
  }, [dropAnimationComplete]);

  return dropAnimationComplete;
};
