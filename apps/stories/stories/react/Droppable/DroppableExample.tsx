import React, {useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {createRange} from '../../utilities';
import {Button, Dropzone} from '../components';
import {DraggableIcon} from '../icons';

interface Props {
  droppableCount?: number;
  debug?: boolean;
}

export function DroppableExample({droppableCount = 1, debug}: Props) {
  const [parent, setParent] = useState<UniqueIdentifier | undefined>();
  const draggable = <Draggable id="draggable" />;

  return (
    <DragDropProvider
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
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
        {createRange(droppableCount).map((id) => (
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
