import {DragDropProvider, useDraggable} from '@dnd-kit/solid';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return <button ref={ref} class="btn">draggable</button>;
}

export default function App() {
  return (
    <DragDropProvider>
      <Draggable />
    </DragDropProvider>
  );
}
