import React, {useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';

import {Button, Dropzone} from '../components';
import {DraggableIcon} from '../icons';

interface Props {
  parents?: UniqueIdentifier[];
}

export function DroppableExample({parents = ['A']}: Props) {
  const [parent, setParent] = useState<UniqueIdentifier | undefined>();
  const draggable = <Draggable id="draggable" />;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const {target} = event.operation;

        if (event.canceled) {
          return;
        }

        setParent(target?.id);
      }}
    >
      <section>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          {parent == null ? draggable : null}
        </div>
        {parents.map((id) => (
          <Droppable key={id} id={id}>
            {parent === id ? draggable : null}
          </Droppable>
        ))}
      </section>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: UniqueIdentifier;
}

function Draggable({id}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);

  const {isDragSource} = useDraggable({
    id,
    element,
  });

  return (
    <Button ref={setElement} shadow={isDragSource}>
      <DraggableIcon />
    </Button>
  );
}

interface DroppableProps {
  id: UniqueIdentifier;
}

function Droppable({id, children}: PropsWithChildren<DroppableProps>) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <Dropzone ref={ref} highlight={isDropTarget}>
      {children}
    </Dropzone>
  );
}
