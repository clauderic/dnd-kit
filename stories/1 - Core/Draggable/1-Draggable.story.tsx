import React, {useMemo, useState} from 'react';
import {
  DndContext,
  useDraggable,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  PointerActivationConstraint,
  Modifiers,
  useSensors,
} from '@dnd-kit/core';
import {
  createSnapModifier,
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
  restrictToWindowEdges,
  snapCenterToCursor,
} from '@dnd-kit/modifiers';
import type {Coordinates} from '@dnd-kit/utilities';

import {
  Axis,
  Draggable,
  Grid,
  OverflowWrapper,
  Wrapper,
} from '../../components';

export default {
  title: 'Core/Draggable/Hooks/useDraggable',
};

const defaultCoordinates = {
  x: 0,
  y: 0,
};

interface Props {
  activationConstraint?: PointerActivationConstraint;
  axis?: Axis;
  handle?: boolean;
  modifiers?: Modifiers;
  buttonStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  label?: string;
}

function DraggableStory({
  activationConstraint,
  axis,
  handle,
  label = 'Go ahead, drag me.',
  modifiers,
  style,
  buttonStyle,
}: Props) {
  const [{x, y}, setCoordinates] = useState<Coordinates>(defaultCoordinates);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({delta}) => {
        setCoordinates(({x, y}) => {
          return {
            x: x + delta.x,
            y: y + delta.y,
          };
        });
      }}
      modifiers={modifiers}
    >
      <Wrapper>
        <DraggableItem
          axis={axis}
          label={label}
          handle={handle}
          top={y}
          left={x}
          style={style}
          buttonStyle={buttonStyle}
        />
      </Wrapper>
    </DndContext>
  );
}

interface DraggableItemProps {
  label: string;
  handle?: boolean;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  axis?: Axis;
  top?: number;
  left?: number;
}

function DraggableItem({
  axis,
  label,
  style,
  top,
  left,
  handle,
  buttonStyle,
}: DraggableItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: 'draggable',
  });

  return (
    <Draggable
      ref={setNodeRef}
      dragging={isDragging}
      handle={handle}
      label={label}
      listeners={listeners}
      style={{...style, top, left}}
      buttonStyle={buttonStyle}
      transform={transform}
      axis={axis}
      {...attributes}
    />
  );
}

export const BasicSetup = () => <DraggableStory />;

export const DragHandle = () => (
  <DraggableStory label="Drag with the handle" handle />
);

export const PressDelay = () => (
  <DraggableStory
    label="Hold me to drag"
    activationConstraint={{
      delay: 250,
      tolerance: 5,
    }}
  />
);

export const MinimumDistance = () => (
  <DraggableStory
    label="I'm activated after dragging 15px"
    activationConstraint={{
      distance: 15,
    }}
  />
);

export const MinimumDistanceX = () => (
  <DraggableStory
    label="I'm activated after dragging 15px on the x axis"
    activationConstraint={{
      distance: {x: 15},
    }}
  />
);

MinimumDistanceX.storyName = 'Minimum Distance – X Axis';

export const MinimumDistanceY = () => (
  <DraggableStory
    label="I'm activated after dragging 15px on the y axis"
    activationConstraint={{
      distance: {y: 15},
    }}
  />
);

MinimumDistanceY.storyName = 'Minimum Distance – Y Axis';

export const MinimumDistanceXY = () => (
  <DraggableStory
    label="I'm activated after dragging 15px on the x and y axis"
    activationConstraint={{
      distance: {x: 15, y: 15},
    }}
  />
);

MinimumDistanceXY.storyName = 'Minimum Distance – X&Y Axis';

export const MinimumDistanceXToleranceY = () => (
  <DraggableStory
    label="I'm activated after dragging 15px on the x axis and aborted after dragging 30px on the y axis"
    activationConstraint={{
      distance: {x: 15},
      tolerance: {y: 30},
    }}
  />
);

MinimumDistanceXToleranceY.storyName =
  'Minimum Distance X Axis and Tolerance Y Axis';

export const MinimumDistanceYToleranceX = () => (
  <DraggableStory
    label="I'm activated after dragging 15px on the y axis and aborted after dragging 30px on the x axis"
    activationConstraint={{
      distance: {y: 15},
      tolerance: {x: 30},
    }}
  />
);

MinimumDistanceYToleranceX.storyName =
  'Minimum Distance Y Axis and Tolerance X Axis';

export const HorizontalAxis = () => (
  <DraggableStory
    label="Draggable horizontally"
    axis={Axis.Horizontal}
    modifiers={[restrictToHorizontalAxis]}
  />
);

export const VerticalAxis = () => (
  <DraggableStory
    label="Draggable vertically"
    axis={Axis.Vertical}
    modifiers={[restrictToVerticalAxis]}
  />
);

export const RestrictToWindowEdges = () => (
  <OverflowWrapper>
    <DraggableStory
      label="I'm only draggable within the window bounds"
      modifiers={[restrictToWindowEdges]}
    />
  </OverflowWrapper>
);

export const SnapToGrid = () => {
  const [gridSize, setGridSize] = React.useState(30);
  const style = {
    alignItems: 'flex-start',
  };
  const buttonStyle = {
    marginLeft: gridSize - 20 + 1,
    marginTop: gridSize - 20 + 1,
    width: gridSize * 8 - 1,
    height: gridSize * 2 - 1,
  };
  const snapToGrid = useMemo(() => createSnapModifier(gridSize), [gridSize]);

  return (
    <>
      <DraggableStory
        label={`Snapping to ${gridSize}px increments`}
        modifiers={[snapToGrid]}
        style={style}
        buttonStyle={buttonStyle}
        key={gridSize}
      />
      <Grid size={gridSize} onSizeChange={setGridSize} />
    </>
  );
};

export const SnapCenterToCursor = () => (
  <DraggableStory
    label="When you grab me, my center will move to where the cursor is."
    modifiers={[snapCenterToCursor]}
  ></DraggableStory>
);
