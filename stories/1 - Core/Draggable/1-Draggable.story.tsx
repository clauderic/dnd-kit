import React, {useCallback, useMemo, useRef, useState} from 'react';
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
  type DragPendingEvent,
  useDndMonitor,
} from '@dnd-kit/core';
import {
  createSnapModifier,
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
  restrictToWindowEdges,
  snapCenterToCursor,
} from '@dnd-kit/modifiers';
import type {Coordinates} from '@dnd-kit/utilities';
import type {StoryObj} from '@storybook/react';

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
  showConstraintCue?: boolean;
}

function DraggableStory({
  activationConstraint,
  axis,
  handle,
  label = 'Go ahead, drag me.',
  modifiers,
  style,
  buttonStyle,
  showConstraintCue,
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
  const Item = showConstraintCue ? DraggableItemWithVisualCue : DraggableItem;

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
        <Item
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
  const {attributes, isDragging, listeners, setNodeRef, transform} =
    useDraggable({
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

function DraggableItemWithVisualCue(props: DraggableItemProps) {
  const {attributes, isDragging, listeners, node, setNodeRef, transform} =
    useDraggable({id: 'draggable'});

  const [isPending, setIsPending] = useState(false);
  const [pendingDelayMs, setPendingDelay] = useState(0);
  const [distanceCue, setDistanceCue] = useState<
    (Coordinates & {size: number}) | null
  >(null);
  const distanceCueRef = useRef<HTMLDivElement>(null);

  const handlePending = useCallback(
    (event: DragPendingEvent) => {
      setIsPending(true);
      const {constraint} = event;
      if ('delay' in constraint) {
        setPendingDelay(constraint.delay);
      }
      if ('distance' in constraint && typeof constraint.distance === 'number') {
        const {distance} = constraint;
        if (event.offset === undefined && node.current !== null) {
          // Infer the position of the pointer relative to the element.
          // Only do this once at the start, as the offset is defined
          // when the pointer moves.
          const {x: rx, y: ry} = node.current.getBoundingClientRect();
          setDistanceCue({
            x: event.initialCoordinates.x - rx - distance,
            y: event.initialCoordinates.y - ry - distance,
            size: distance * 2,
          });
        }
        if (distanceCueRef.current === null) {
          return;
        }
        const {x, y} = event.offset ?? {x: 0, y: 0};
        const length = Math.sqrt(x * x + y * y);
        const ratio = length / Math.max(distance, 1);
        const fanAngle = 360 * (1 - ratio);
        const rotation = Math.atan2(y, x) * (180 / Math.PI) - 90 - fanAngle / 2;
        const {style} = distanceCueRef.current;
        style.setProperty(
          'background-image',
          `conic-gradient(red ${fanAngle}deg, transparent 0deg)`
        );
        style.setProperty('rotate', `${rotation}deg`);
        style.setProperty('opacity', `${0.25 + ratio * 0.75}`);
      }
    },
    [node]
  );

  const handlePendingEnd = useCallback(() => setIsPending(false), []);

  useDndMonitor({
    onDragPending: handlePending,
    onDragAbort: handlePendingEnd,
    onDragCancel: handlePendingEnd,
    onDragEnd: handlePendingEnd,
  });

  const pendingStyle: React.CSSProperties = isPending
    ? {animationDuration: `${pendingDelayMs}ms`}
    : {};

  return (
    <>
      <Draggable
        ref={setNodeRef}
        dragging={isDragging}
        handle={props.handle}
        label={props.label}
        listeners={listeners}
        style={{...props.style, top: props.top, left: props.left}}
        buttonStyle={{...props.buttonStyle, ...pendingStyle}}
        isPendingDelay={isPending && pendingDelayMs > 0}
        transform={transform}
        axis={props.axis}
        {...attributes}
      >
        {isPending && !isDragging && distanceCue && (
          <div
            ref={distanceCueRef}
            style={{
              borderRadius: '50%',
              position: 'absolute',
              backgroundImage: 'conic-gradient(red 360deg, transparent 0deg)',
              opacity: 0.25,
              width: distanceCue.size,
              height: distanceCue.size,
              left: distanceCue.x,
              top: distanceCue.y,
            }}
          ></div>
        )}
      </Draggable>
    </>
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

PressDelay.storyName = 'Press delay';

export const PressDelayOrDistance = () => (
  <DraggableStory
    label="Activated dragging 3px or holding 250ms"
    activationConstraint={{
      delay: 250,
      distance: 3,
      tolerance: 10,
    }}
  />
);

PressDelayOrDistance.storyName = 'Press delay or minimum distance';

type PressDelayWithVisualCueArgs = {
  delay: number;
  tolerance: number;
};

export const PressDelayWithVisualCue: StoryObj<PressDelayWithVisualCueArgs> = {
  render: (args) => (
    <DraggableStory
      label={`Press and hold for ${args.delay}ms to drag`}
      activationConstraint={args}
      showConstraintCue={true}
    />
  ),
  args: {delay: 500, tolerance: 5},
  argTypes: {
    delay: {
      name: 'Delay (ms)',
      control: {type: 'range', min: 250, max: 1000, step: 50},
    },
    tolerance: {control: 'number', name: 'Tolerance (px)'},
  },
};

export const MinimumDistance = () => (
  <DraggableStory
    label="I'm activated after dragging 15px"
    activationConstraint={{
      distance: 15,
    }}
  />
);

export const MinimumDistanceWithVisualCue: StoryObj<{
  distance: number;
}> = {
  render: (args) => (
    <DraggableStory
      label={`I'm activated after dragging ${args.distance}px`}
      activationConstraint={{distance: args.distance}}
      showConstraintCue={true}
    />
  ),
  args: {distance: 60},
  argTypes: {distance: {control: {type: 'range', min: 10, max: 80}}},
};

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
