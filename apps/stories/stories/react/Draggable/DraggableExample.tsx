import React, {
  type PropsWithChildren,
  type CSSProperties,
  useRef,
  useState,
} from 'react';
import type {Modifiers, Sensors} from '@dnd-kit/abstract';
import type {FeedbackType} from '@dnd-kit/dom';
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
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  style?: CSSProperties;
}

export function Draggable({
  id,
  modifiers,
  handle,
  feedback,
  style,
}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const {isDragging} = useDraggable({
    id,
    modifiers,
    element,
    feedback,
    handle: handleRef,
  });

  return (
    <Button
      ref={setElement}
      shadow={isDragging}
      actions={handle ? <Handle ref={handleRef} variant="dark" /> : undefined}
      style={style}
    >
      <DraggableIcon />
    </Button>
  );
}
