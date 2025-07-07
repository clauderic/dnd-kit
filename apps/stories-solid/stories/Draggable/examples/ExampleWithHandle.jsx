import { DragDropProvider } from '@dnd-kit/solid';
import { Draggable } from './DraggableWithHandle';

export function ExampleWithHandle() {
  return (
    <DragDropProvider>
      <Draggable id="draggable" />
    </DragDropProvider>
  );
}