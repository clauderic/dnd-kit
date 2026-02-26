import React, {
  type PropsWithChildren,
  type CSSProperties,
  useRef,
  useState,
} from 'react';
import type {Modifiers, Plugins, Sensors} from '@dnd-kit/abstract';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/react';

import {Button, Handle} from '../components';

interface Props {
  container?: React.FC<PropsWithChildren<{}>> | string;
  handle?: boolean;
  overlay?: boolean;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

export function DraggableExample(props: Props) {
  const {container, overlay, sensors} = props;
  const Wrapper = container ?? 'div';

  return (
    <DragDropProvider sensors={sensors}>
      <Wrapper>
        <Draggable id="draggable" {...props} />
        {overlay && (
          <DragOverlay>
            <Button shadow style={{width: '100%'}}>
              overlay
              <Handle variant="dark" />
            </Button>
          </DragOverlay>
        )}
      </Wrapper>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: string;
  handle?: boolean;
  plugins?: Plugins;
  modifiers?: Modifiers;
  style?: CSSProperties;
  overlay?: boolean;
}

export function Draggable({
  id,
  modifiers,
  handle,
  plugins,
  style,
  overlay,
}: DraggableProps) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const {isDragging} = useDraggable({
    id,
    modifiers,
    element,
    plugins,
    handle: handleRef,
  });

  return (
    <Button
      ref={setElement}
      actions={handle ? <Handle ref={handleRef} variant="dark" /> : undefined}
      disabled={isDragging && overlay}
      shadow={isDragging && !overlay}
      style={style}
    >
      draggable
    </Button>
  );
}
