import React, {PropsWithChildren, useState} from 'react';
import type {Modifiers, UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

import {Button} from '../components';
import {DraggableIcon} from '../icons';

interface Props {
  container?: boolean;
  modifiers?: Modifiers;
}

export function DraggableExample({container, modifiers}: Props) {
  const Wrapper = container ? Container : 'div';

  return (
    <DragDropProvider modifiers={modifiers}>
      <Wrapper>
        <Draggable id="draggable" />
      </Wrapper>
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

function Container({children}: PropsWithChildren) {
  return (
    <div
      style={{
        display: 'flex',
        width: '60%',
        minWidth: 300,
        margin: '40px 80px',
        height: 350,
        border: '1px solid',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'rgba(0,0,0,0.2)',
        padding: 30,
        borderRadius: 8,
      }}
      data-container
    >
      {children}
    </div>
  );
}
