import {DragDropProvider, useDraggable} from '@dnd-kit/solid';

function Draggable() {
  const {isDragging, ref, handleRef} = useDraggable({id: 'draggable'});

  return (
    <div class="btn" ref={ref} data-shadow={isDragging() ? 'true' : undefined}>
      draggable
      <button ref={handleRef} class="handle" />
    </div>
  );
}

export default function App() {
  return (
    <DragDropProvider>
      <Draggable />
    </DragDropProvider>
  );
}
