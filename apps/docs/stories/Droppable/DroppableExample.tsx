import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/react';
import {closestCenter, CollisionDetector} from '@dnd-kit/collision';

import {Button, Dropzone} from '../components';
import {DraggableIcon} from '../icons';

export function DroppableExample() {
  const [items, setItems] = useState({
    A: {
      A1: [{id: 'A1', type: 'A'}],
      A2: [],
      A3: [],
      A4: [],
      A5: [],
      A6: [],
      A7: [],
    },
    B: {
      B1: [],
      B2: [{id: 'A2', type: 'A'}],
      B3: [],
      B4: [],
    },
    C: {
      C1: [],
      C2: [],
      C3: [],
      C4: [],
    },
  });

  return (
    <DndContext
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (source && target) {
          const targetRowId = target.id;
          const currentRowId = source.data!.parent;
          const [targetColumnId] = String(target.id);
          const [currentColumnId] = String(currentRowId);

          if (currentRowId !== targetRowId) {
            setItems((items) => {
              const newItems = {...items};

              newItems[currentColumnId][currentRowId] = newItems[
                currentColumnId
              ][currentRowId].filter((child) => child.id !== source.id);

              newItems[targetColumnId][targetRowId] = [
                ...newItems[targetColumnId][targetRowId],
                {id: source.id, type: source.type},
              ];

              return newItems;
            });
          }
        }
      }}
    >
      <div style={{display: 'flex', flexDirection: 'row', gap: 20}}>
        {Object.entries(items).map(([columnId, items]) => (
          <div
            key={columnId}
            style={{display: 'flex', flexDirection: 'column', gap: 20}}
          >
            {Object.entries(items).map(([rowId, children]) => (
              <Droppable
                key={rowId}
                id={rowId}
                accept={['A']}
                collisionDetector={closestCenter}
              >
                {children.map((child) => (
                  <Draggable id={child.id} type={child.type} parent={rowId} />
                ))}
              </Droppable>
            ))}
          </div>
        ))}
      </div>
    </DndContext>
  );
}

interface DraggableProps {
  id: UniqueIdentifier;
  parent: UniqueIdentifier;
  type?: UniqueIdentifier;
}

function Draggable({id, parent, type}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);
  const activatorRef = useRef<HTMLButtonElement | null>(null);

  const {isDragging} = useDraggable({
    id,
    data: {parent},
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
