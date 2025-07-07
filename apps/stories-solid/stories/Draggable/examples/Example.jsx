import { DragDropProvider } from '@dnd-kit/solid';
import { Draggable } from './Draggable';

export function Example() {
  return (
    <DragDropProvider>
      <Draggable id="draggable" />
    </DragDropProvider>
  );
}