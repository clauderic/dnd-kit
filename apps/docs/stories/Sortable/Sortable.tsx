import React, {useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/react';
import {closestCenter, CollisionDetector} from '@dnd-kit/collision';

const items = {
  A: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
  B: ['B1', 'B2', 'B3', 'B4', 'B5'],
  C: ['C1', 'C2', 'C3'],
};

export function App() {
  const draggableMarkup = <Draggable id="test-1" type="A" />;

  return (
    <DndContext>
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
  const activatorRef = useRef<HTMLButtonElement | null>(null);

  const {isDragging} = useDraggable({
    id,
    element,
    activator: activatorRef,
    type,
  });

  return (
    <div
      ref={setElement}
      style={{
        display: 'inline-block',
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      I am draggable
      <button draggable ref={activatorRef}>
        ::
      </button>
    </div>
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
  const {ref, isDropTarget} = useDroppable({id, accept, collisionDetector});

  return (
    <div
      ref={ref}
      style={{
        width: 300,
        height: 300,
        border: '1px solid #DEDEDE',
        borderRadius: 10,
        margin: 10,
        backgroundColor: isDropTarget ? 'green' : undefined,
      }}
    >
      <div>Container: {id}</div>

      <div>{children}</div>
    </div>
  );
}
