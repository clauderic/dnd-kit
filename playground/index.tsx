import 'react-app-polyfill/ie11';
import * as React from 'react';
import {useMemo, useState} from 'react';
import * as ReactDOM from 'react-dom';

import {
  defaultCoordinates,
  DraggableContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Translate,
  useDraggable,
  useDroppable,
  useSensor,
  UniqueIdentifier,
  rectIntersection,
} from '@dropshift/core';
import {CSS} from '@dropshift/utilities';

const Playground = () => {
  const containers = ['A', 'B', 'C'];
  const [{translate}, setTranslate] = useState<{
    initialTranslate: Translate;
    translate: Translate;
  }>({initialTranslate: defaultCoordinates, translate: defaultCoordinates});
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);
  const mouseSensor = useSensor(MouseSensor, {});
  const touchSensor = useSensor(TouchSensor, {});
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useMemo(() => [mouseSensor, touchSensor, keyboardSensor], [
    mouseSensor,
    touchSensor,
    keyboardSensor,
  ]);

  const item = <Draggable translate={translate} />;

  return (
    <DraggableContext
      sensors={sensors}
      collisionDetection={rectIntersection}
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
      onDragEnd={({over}) => {
        setParent(over ? over.id : null);
        setTranslate(() => ({
          translate: defaultCoordinates,
          initialTranslate: defaultCoordinates,
        }));
      }}
      onDragCancel={() => {
        setTranslate(({initialTranslate}) => ({
          translate: initialTranslate,
          initialTranslate: defaultCoordinates,
        }));
      }}
    >
      {parent === null ? item : null}

      <div style={{display: 'flex'}}>
        {containers.map((id) => (
          <Droppable key={id} id={id}>
            {parent === id ? item : 'Drop here'}
          </Droppable>
        ))}
      </div>
    </DraggableContext>
  );
};

interface DraggableProps {
  translate: Translate;
}

function Draggable({translate}: DraggableProps) {
  const {isDragging, setNodeRef, listeners} = useDraggable({
    id: 'draggable-item',
  });

  return (
    <button
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString({
          ...translate,
          scaleX: 1,
          scaleY: 1,
        }),
        boxShadow: isDragging
          ? '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
          : undefined,
      }}
      {...listeners}
    >
      Drag me
    </button>
  );
}

interface DroppableProps {
  children: React.ReactNode;
  id: string;
}

function Droppable({id, children}: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({id});

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 150,
        border: '1px solid',
        margin: 20,
        borderColor: isOver ? '#4c9ffe' : '#EEE',
      }}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

ReactDOM.render(<Playground />, document.getElementById('root'));
