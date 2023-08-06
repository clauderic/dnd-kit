import React, {useEffect, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/react';
import {closestCenter, CollisionDetector} from '@dnd-kit/collision';

import {Button, Dropzone, Handle} from '../components';
import {DraggableIcon} from '../icons';
import {cloneDeep} from '../utilities';

export function DroppableExample() {
  const [items, setItems] = useState({
    A: {
      A1: [{id: 0, type: 'A'}],
      A2: [],
      A3: [],
      A4: [],
      A5: [],
      A6: [],
      A7: [],
    },
    B: {
      B1: [],
      B2: [{id: 1, type: 'B'}],
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
  const snapshot = useRef(cloneDeep(items));

  return (
    <DndContext
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onCollision={(event, manager) => {
        const [firstCollision] = event.collisions;
        manager.actions.setDropTarget(firstCollision?.id);
      }}
      onDragEnd={(event) => {
        const {source, target} = event.operation;

        if (event.canceled) {
          return;
        }

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
                ...newItems[targetColumnId][targetRowId].filter(
                  (child) => child.id !== source.id
                ),
                {id: source.id, type: source.type},
              ];

              return newItems;
            });
          }
        }
      }}
      // onDragEnd={(event) => {
      //   if (event.canceled) {
      //     setItems(snapshot.current);
      //   }
      // }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 20,
        }}
      >
        {Object.entries(items).map(([columnId, items]) => (
          <div
            key={columnId}
            style={{display: 'flex', flexDirection: 'column', gap: 20}}
          >
            {Object.entries(items).map(([rowId, children]) => (
              <Droppable
                key={rowId}
                id={rowId}
                accept={['A', 'B']}
                collisionDetector={closestCenter}
              >
                {children.map((child) => (
                  <Draggable
                    key={child.id}
                    id={child.id}
                    type={child.type}
                    parent={rowId}
                  />
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
    <Button
      ref={setElement}
      shadow={isDragging}
      actions={type === 'B' ? <Handle ref={activatorRef} light /> : undefined}
    >
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
  const {ref, isDropTarget} = useDroppable({id, accept, collisionDetector});

  return (
    <Dropzone ref={ref} highlight={isDropTarget}>
      {children}
    </Dropzone>
  );
}
