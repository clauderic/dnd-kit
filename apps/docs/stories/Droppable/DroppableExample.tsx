import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/react';
import {closestCenter, CollisionDetector} from '@dnd-kit/collision';

import {Button, Dropzone} from '../components';
import {DraggableIcon} from '../icons';

export function DroppableExample() {
  const [items, setItems] = useState({
    A: [
      {id: 'A1', children: [{id: 'A1', type: 'A'}]},
      {id: 'A2', children: []},
      {id: 'A3', children: []},
      {id: 'A4', children: []},
      {id: 'A5', children: []},
      {id: 'A6', children: []},
      {id: 'A7', children: []},
    ],
    B: [
      {id: 'B1', children: []},
      {id: 'B2', children: [{id: 'A2', type: 'A'}]},
      {id: 'B3', children: []},
      {id: 'B4', children: []},
    ],
    C: [
      {id: 'C1', children: []},
      {id: 'C2', children: []},
      {id: 'C3', children: []},
      {id: 'C4', children: []},
    ],
  });

  return (
    <DndContext
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (source && target) {
          const [targetParentId] = String(target.id);
          const [currentParentId] = String(source.data!.parent);

          if (source.data!.parent !== target.id) {
            setItems((items) => {
              if (targetParentId !== currentParentId) {
                return {
                  ...items,
                  [currentParentId]: items[currentParentId].map((item) => {
                    if (item.id === source.data!.parent) {
                      return {
                        ...item,
                        children: item.children.filter(
                          (child) => child.id !== source.id
                        ),
                      };
                    }

                    return item;
                  }),
                  [targetParentId]: items[targetParentId].map((item) => {
                    if (item.id === target.id) {
                      return {
                        ...item,
                        children: [
                          ...item.children,
                          {id: source.id, type: source.type},
                        ],
                      };
                    }

                    return item;
                  }),
                };
              } else {
                return {
                  ...items,
                  [targetParentId]: items[targetParentId].map((item) => {
                    if (item.id === target.id) {
                      return {
                        ...item,
                        children: [
                          ...item.children,
                          {id: source.id, type: source.type},
                        ],
                      };
                    }

                    if (item.id === source.data!.parent) {
                      return {
                        ...item,
                        children: item.children.filter(
                          (child) => child.id !== source.id
                        ),
                      };
                    }

                    return item;
                  }),
                };
              }
            });
          }
        }
      }}
    >
      <div style={{display: 'flex', flexDirection: 'row', gap: 20}}>
        {Object.entries(items).map(([id, items]) => (
          <div
            key={id}
            style={{display: 'flex', flexDirection: 'column', gap: 20}}
          >
            {items.map((item) => (
              <Droppable
                key={item.id}
                id={item.id}
                accept={['A']}
                collisionDetector={closestCenter}
              >
                {item.children.map((child) => (
                  <Draggable id={child.id} type={child.type} parent={item.id} />
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
