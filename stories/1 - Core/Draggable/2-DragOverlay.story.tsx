import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
  Modifiers,
  useDraggable,
  Translate,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import {Axis, Draggable, Wrapper} from '../../components';

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

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

function DragOverlayExample({
  axis,
  dragOverlayModifiers,
  dropAnimation = defaultDropAnimationConfig,
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
