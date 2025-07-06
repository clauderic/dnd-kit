import {createSignal, JSX, Show} from 'solid-js';
import type {Modifiers, Sensors} from '@dnd-kit/abstract';
import {DragDropProvider, DragOverlay, useDraggable} from '@dnd-kit/solid';

import {Button} from '@/components/button';
import {DraggableIcon} from '@/components/icons/DraggableIcon';
import { Handle } from '@/components/handle';

interface Props {
  container?: (props: {children: JSX.Element}) => JSX.Element | string;
  handle?: boolean;
  overlay?: boolean;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

console.log(`DraggableExample`, DragDropProvider);

export function DraggableExample(props: Props) {
  return (
    <DragDropProvider sensors={props.sensors}>
      <div>
        <Draggable id="draggable" {...props} />
        <Show when={props.overlay}>
          <DragOverlay>
            <Button style={{width: '100%'}}>
              Drag overlay
              <Handle variant="dark" />
            </Button>
          </DragOverlay>
        </Show>
      </div>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: string;
  handle?: boolean;
  feedback?: any;
  modifiers?: Modifiers;
  style?: any;
  overlay?: boolean;
}

export function Draggable({
  id,
  modifiers,
  handle,
  feedback,
  style,
  overlay,
}: DraggableProps) {
  const {isDragging, ref, handleRef} = useDraggable({
    id,
    modifiers,
    feedback,
  });

  return (
    <Button
      ref={ref}
      disabled={isDragging() && overlay}
      style={style}
    >
      {handle ? <Handle ref={handleRef} variant="dark" /> : null}
      <DraggableIcon />
    </Button>
  );
}
