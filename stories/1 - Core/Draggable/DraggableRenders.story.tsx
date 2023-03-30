import React, {Profiler, useMemo, useRef, useState} from 'react';
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

import type {Coordinates} from '@dnd-kit/utilities';

import {Axis, Draggable, Wrapper} from '../../components';

export default {
  title: 'Core/Draggable/DraggableRenders',
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
  const [coordinated, setCoordinates] = useState<{[id: string]: Coordinates}>({
    '1': defaultCoordinates,
    '2': defaultCoordinates,
    '3': defaultCoordinates,
  });
  const sensorOptions = useMemo(
    () => ({
      activationConstraint,
    }),
    [activationConstraint]
  );
  const mouseSensor = useSensor(MouseSensor, sensorOptions);
  const touchSensor = useSensor(TouchSensor, sensorOptions);
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({delta, active}) => {
        setCoordinates((state) => {
          return {
            ...state,
            [active.id]: {
              x: state[active.id].x + delta.x,
              y: state[active.id].y + delta.y,
            },
          };
        });
      }}
      modifiers={modifiers}
    >
      <Wrapper>
        <MemoDraggableItem
          key="1"
          id="1"
          axis={axis}
          label={label}
          handle={handle}
          top={coordinated['1'].y}
          left={coordinated['1'].x}
          style={style}
          buttonStyle={buttonStyle}
        />
        <MemoDraggableItem
          key="2"
          id="2"
          axis={axis}
          label={label}
          handle={handle}
          top={coordinated['2'].y}
          left={coordinated['2'].x}
          style={style}
          buttonStyle={buttonStyle}
        />
        <MemoDraggableItem
          key="3"
          id="3"
          axis={axis}
          label={label}
          handle={handle}
          top={coordinated['3'].y}
          left={coordinated['3'].x}
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
  id: string;
}

function DraggableItem({
  id,
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
      id: id,
    });
  const span = useRef<HTMLSpanElement>(null);

  return (
    <Profiler
      id="App"
      onRender={(id, phase) => {
        if (phase === 'update' && span.current) {
          span.current.innerHTML = 'updated';
        }
      }}
    >
      <div>
        <span data-testid={`draggable-status-${id}`} ref={span}>
          mounted
        </span>
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
      </div>
    </Profiler>
  );
}

//we are memoizing the draggable item to prevent it all items from re-rendering when one of them changes coordinates.
//so it will be easier to test
//changes in the context are ignored by the memoization
const MemoDraggableItem = React.memo(DraggableItem);

export const BasicSetup = () => <DraggableStory />;
