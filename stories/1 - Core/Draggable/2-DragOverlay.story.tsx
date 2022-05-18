import React from 'react';
import {DndContext, useDraggable} from '@dnd-kit/core';
import type {DropAnimation, Modifiers, Translate} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import {Axis, Draggable, DraggableOverlay, Wrapper} from '../../components';

export default {
  title: `Core/Draggable/Components/\u003CDragOverlay\u003E`,
};

interface Props {
  axis?: Axis;
  dragOverlayModifiers?: Modifiers;
  dropAnimation?: DropAnimation | null;
  handle?: boolean;
  label?: string;
  modifiers?: Modifiers;
  style?: React.CSSProperties;
}

function DragOverlayExample({
  axis,
  dropAnimation,
  handle,
  label,
  modifiers,
}: Props) {
  return (
    <DndContext modifiers={modifiers}>
      <Wrapper>
        <DraggableItem axis={axis} handle={handle} label={label} />
      </Wrapper>
      <DraggableOverlay axis={axis} dropAnimation={dropAnimation} />
    </DndContext>
  );
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
