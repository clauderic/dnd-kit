import React, {useState} from 'react';
import type {Modifiers, UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

import {Button} from '../components';
import {DraggableIcon} from '../icons';

interface Props {
  modifiers?: Modifiers;
}

export function DraggableExample({modifiers}: Props) {
  return (
    <DragDropProvider modifiers={modifiers}>
      <Draggable id="draggable" />
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
