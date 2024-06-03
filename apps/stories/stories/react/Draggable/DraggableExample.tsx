import React, {PropsWithChildren, useRef, useState} from 'react';
import type {Modifiers, Sensors} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

import {Button, Handle} from '../components';
import {DraggableIcon} from '../icons';

interface Props {
  container?: React.FC<PropsWithChildren<{}>> | string;
  handle?: boolean;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

export function DraggableExample({
  container,
  handle,
  modifiers,
  sensors,
}: Props) {
  const Wrapper = container ?? 'div';

  return (
    <DragDropProvider sensors={sensors}>
      <Wrapper>
        <Draggable id="draggable" modifiers={modifiers} handle={handle} />
      </Wrapper>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: string;
  handle?: boolean;
  modifiers?: Modifiers;
}

function Draggable({id, modifiers, handle}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const {isDragSource} = useDraggable({
    id,
    modifiers,
    element,
    handle: handleRef,
  });

  return (
    <Button
      ref={setElement}
      shadow={isDragSource}
      actions={handle ? <Handle ref={handleRef} variant="dark" /> : undefined}
    >
      <DraggableIcon />
    </Button>
  );
}
