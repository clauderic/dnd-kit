import React, {PropsWithChildren, useState} from 'react';
import type {Modifiers, Sensors} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

import {Button} from '../components';
import {DraggableIcon} from '../icons';

interface Props {
  container?: React.FC<PropsWithChildren<{}>> | string;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

export function DraggableExample({container, modifiers, sensors}: Props) {
  const Wrapper = container ?? 'div';

  return (
    <DragDropProvider sensors={sensors}>
      <Wrapper>
        <Draggable id="draggable" modifiers={modifiers} />
      </Wrapper>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: string;
  modifiers?: Modifiers;
}

function Draggable({id, modifiers}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);

  const {isDragSource} = useDraggable({
    id,
    modifiers,
    element,
  });

  return (
    <Button ref={setElement} shadow={isDragSource}>
      <DraggableIcon />
    </Button>
  );
}
