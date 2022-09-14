import React from 'react';
import {UniqueIdentifier} from '@dnd-kit/types';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/react';
import {closestCenter, CollisionDetector} from '@dnd-kit/collision';

const items = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

export function App() {
  return (
    <DndContext>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div>
          {items.map((id) => (
            <Droppable
              key={id}
              id={`A${id}`}
              collisionDetector={closestCenter}
            />
          ))}
        </div>

        <div style={{maxHeight: '60vh', overflow: 'auto'}}>
          <Draggable id="test-1" />
          <div style={{height: 20}} />
          <Draggable id="test-2" />
          {items.map((id) => (
            <Droppable key={id} id={`B${id}`} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

interface DraggableProps {
  id: UniqueIdentifier;
}

function Draggable({id}: DraggableProps) {
  const {ref, activatorRef} = useDraggable({id});

  return (
    <div ref={ref}>
      I am draggable
      <button ref={activatorRef}>::</button>
    </div>
  );
}

interface DroppableProps {
  id: UniqueIdentifier;
  collisionDetector?: CollisionDetector;
}

function Droppable({id, collisionDetector}: DroppableProps) {
  const {ref, isOver} = useDroppable({id, collisionDetector});

  return (
    <div
      ref={ref}
      style={{
        width: 300,
        height: 300,
        border: '1px solid #DEDEDE',
        borderRadius: 10,
        margin: 10,
        backgroundColor: isOver ? 'green' : undefined,
      }}
    >
      Container: {id}
    </div>
  );
}
