import React, {useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  ActivationConstraint,
  DraggableContext,
  DraggableClone,
  Modifiers,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  restrictToWindowEdges,
  useSensor,
  useDraggable,
  UniqueIdentifier,
} from '@dropshift/core';
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from '@dropshift/modifiers';
import {CSS} from '@dropshift/utilities';

import {Item, List} from '../../components';

export default {
  title: 'Core|Draggable/Clone',
};

interface Props {
  activationConstraint?: ActivationConstraint;
  handle?: boolean;
  translateModifiers?: Modifiers;
  cloneTranslateModifiers?: Modifiers;
  style?: React.CSSProperties;
  value?: string;
}

function Clone({
  activationConstraint,
  translateModifiers,
  cloneTranslateModifiers,
  handle,
  value = 'Drag me',
}: Props) {
  const [active, setActive] = useState<{id: UniqueIdentifier} | null>(null);
  const [{translate}, setTranslate] = useState({
    translate: {x: 0, y: 0},
    initialTranslate: {x: 0, y: 0},
  });
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
    <DraggableContext
      sensors={sensors}
      translateModifiers={translateModifiers}
      onDragStart={({active}) => {
        setActive(active);
      }}
      onDragMove={() => {}}
      onDragEnd={({delta}) => {
        setTranslate(({translate}) => ({
          initialTranslate: {
            x: translate.x + delta.x,
            y: translate.y + delta.y,
          },
          translate: {
            x: translate.x + delta.x,
            y: translate.y + delta.y,
          },
        }));
      }}
      onDragCancel={() => {
        setTranslate(({initialTranslate}) => ({
          translate: initialTranslate,
          initialTranslate,
        }));
      }}
    >
      <List>
        <DraggableItem
          value={value}
          index={0}
          handle={handle}
          wrapperStyle={{
            transform: CSS.Transform.toString({
              ...translate,
              scaleX: 1,
              scaleY: 1,
            }),
          }}
        />
      </List>
      {createPortal(
        <DraggableClone translateModifiers={cloneTranslateModifiers}>
          {active ? (
            <DraggableItem value={value} index={0} handle={handle} clone />
          ) : null}
        </DraggableClone>,
        document.body
      )}
    </DraggableContext>
  );
}

interface DraggableItemProps {
  clone?: boolean;
  value: React.ReactNode;
  index: number;
  handle?: boolean;
  wrapperStyle?: React.CSSProperties;
}

function DraggableItem({
  value,
  handle,
  clone,
  wrapperStyle,
}: DraggableItemProps) {
  const {setNodeRef, listeners, isDragging} = useDraggable({
    id: 'draggable-item',
  });

  return (
    <Item
      clone={clone}
      ref={setNodeRef}
      value={value}
      dragging={isDragging}
      wrapperStyle={wrapperStyle}
      handle={handle}
      listeners={listeners}
    />
  );
}

export const WithClone = () => <Clone />;
export const DragHandle = () => (
  <Clone value="Drag me with the handle" handle />
);
export const HorizontalAxis = () => (
  <Clone
    value="I'm only draggable horizontally"
    translateModifiers={[restrictToHorizontalAxis]}
  />
);
export const VerticalAxis = () => (
  <Clone
    value="I'm only draggable vertically"
    translateModifiers={[restrictToVerticalAxis]}
  />
);
export const RestrictToWindowEdges = () => (
  <Clone
    value="I'm only draggable within the window bounds"
    translateModifiers={[restrictToWindowEdges]}
  />
);
