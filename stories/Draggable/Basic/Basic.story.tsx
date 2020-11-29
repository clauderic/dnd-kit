import React, {useMemo, useState} from 'react';

import {Item, Grid} from '../../components';

import {
  DndContext,
  useDraggable,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  Translate,
  restrictToWindowEdges,
  ActivationConstraint,
  Modifiers,
} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {
  createSnapModifier,
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';

export default {
  title: 'Core|Draggable/Basic',
};

const defaultItemStyle: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  left: 20,
};

const defaultCoordinates = {
  x: 0,
  y: 0,
};

interface Props {
  activationConstraint?: ActivationConstraint;
  handle?: boolean;
  translateModifiers?: Modifiers;
  style?: React.CSSProperties;
  value?: string;
}

export function DraggableStory({
  activationConstraint,
  handle,
  value = 'Drag me',
  translateModifiers,
  style,
}: Props) {
  const [{translate}, setTranslate] = useState<{
    initialTranslate: Translate;
    translate: Translate;
  }>({initialTranslate: defaultCoordinates, translate: defaultCoordinates});
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useMemo(() => [mouseSensor, touchSensor, keyboardSensor], [
    mouseSensor,
    touchSensor,
    keyboardSensor,
  ]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={() => {}}
      onDragMove={({delta}) => {
        setTranslate(({initialTranslate}) => ({
          initialTranslate,
          translate: {
            x: initialTranslate.x + delta.x,
            y: initialTranslate.y + delta.y,
          },
        }));
      }}
      onDragEnd={() => {
        setTranslate(({translate}) => {
          return {
            translate,
            initialTranslate: translate,
          };
        });
      }}
      onDragCancel={() => {
        setTranslate(({initialTranslate}) => ({
          translate: initialTranslate,
          initialTranslate: defaultCoordinates,
        }));
      }}
      translateModifiers={translateModifiers}
    >
      <DraggableItem
        value={value}
        handle={handle}
        style={{
          ...defaultItemStyle,
          ...style,
          transform: CSS.Transform.toString({
            ...translate,
            scaleX: 1,
            scaleY: 1,
          }),
        }}
      />
    </DndContext>
  );
}

interface DraggableItemProps {
  value: React.ReactNode;
  handle?: boolean;
  style?: React.CSSProperties;
}

function DraggableItem({value, handle, style}: DraggableItemProps) {
  const {attributes, isDragging, listeners, setNodeRef} = useDraggable({
    id: '1',
  });

  return (
    <Item
      clone={isDragging}
      ref={setNodeRef}
      value={value}
      wrapperStyle={style}
      handle={handle}
      listeners={listeners}
      {...attributes}
    />
  );
}

export const SimpleExample = () => <DraggableStory />;

export const DragHandle = () => (
  <DraggableStory value="Drag me with the handle" handle />
);
export const HorizontalAxis = () => (
  <DraggableStory
    value="I'm only draggable horizontally"
    translateModifiers={[restrictToHorizontalAxis]}
  />
);
export const VerticalAxis = () => (
  <DraggableStory
    value="I'm only draggable vertically"
    translateModifiers={[restrictToVerticalAxis]}
  />
);
export const PressDelay = () => (
  <DraggableStory
    value="Hold me for 250ms"
    activationConstraint={{
      delay: 250,
      tolerance: 5,
    }}
  />
);
export const MinimumDistance = () => (
  <DraggableStory
    value="I'm activated after dragging 15px"
    activationConstraint={{
      distance: 15,
    }}
  />
);
export const RestrictToWindowEdges = () => (
  <DraggableStory
    value="I'm only draggable within the window bounds"
    translateModifiers={[restrictToWindowEdges]}
  />
);
export const SnapToGrid = () => {
  const [gridSize, setGridSize] = React.useState(25);
  const itemStyle = {
    top: gridSize + 1,
    left: gridSize + 1,
    width: gridSize * 10 - 2,
    height: gridSize * 2 - 2,
  };
  const snapToGrid = useMemo(() => createSnapModifier(gridSize), [gridSize]);

  return (
    <>
      <DraggableStory
        value={`Snapping to ${gridSize}px increments`}
        translateModifiers={[snapToGrid]}
        style={itemStyle}
        key={gridSize}
      />
      <Grid size={gridSize} onSizeChange={setGridSize} />
    </>
  );
};
