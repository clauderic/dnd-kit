import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/react';
import {closestCenter, CollisionDetector} from '@dnd-kit/collision';

import {Button, Dropzone} from '../components';
import {DraggableIcon} from '../icons';

const items = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

export function DroppableExample() {
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);
  const draggableMarkup = <Draggable id="test-1" type="A" />;

  return (
    <DndContext
      onDragEnd={(event) => {
        console.log(event);
        setParent(event.operation.target?.id ?? null);
      }}
    >
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div>
          {items.map((id) => (
            <Droppable
              key={id}
              id={`A${id}`}
              accept={['A']}
              collisionDetector={closestCenter}
            >
              {parent === `A${id}` ? draggableMarkup : null}
            </Droppable>
          ))}
        </div>

        <div style={{maxHeight: '60vh', overflow: 'auto'}}>
          {parent == null ? draggableMarkup : null}
          <div style={{height: 20}} />
          {/* <Draggable id="test-2" type="B" /> */}
          {items.map((id) => (
            <Droppable key={id} id={`B${id}`} accept={['A', 'B']}>
              {parent === `B${id}` ? draggableMarkup : null}
            </Droppable>
          ))}
        </div>
      </div>
    </DndContext>
  );
}

interface DraggableProps {
  id: UniqueIdentifier;
  type?: UniqueIdentifier;
}

function Draggable({id, type}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('');
  const activatorRef = useRef<HTMLButtonElement | null>(null);

  const {isDragging} = useDraggable({
    id,
    element,
    activator: activatorRef,
    type,
  });

  return (
    <Button ref={setElement} shadow={isDragging}>
      <DraggableIcon />
    </Button>
  );
}

interface DroppableProps {
  id: UniqueIdentifier;
  accept?: UniqueIdentifier[];
  collisionDetector?: CollisionDetector;
}

function Droppable({
  id,
  accept,
  collisionDetector,
  children,
}: PropsWithChildren<DroppableProps>) {
  const {ref, isOver} = useDroppable({id, accept, collisionDetector});

  return (
    <Dropzone ref={ref} highlight={isOver}>
      {children}
    </Dropzone>
  );
}
