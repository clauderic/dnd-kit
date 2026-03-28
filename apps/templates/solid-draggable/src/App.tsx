import {createSignal} from 'solid-js';
import {DragDropProvider, useDraggable} from '@dnd-kit/solid';
import {Droppable} from './Droppable';
import './styles.css';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});
  return <button ref={ref} class="btn">draggable</button>;
}

export default function App() {
  const [parent, setParent] = createSignal(undefined);
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id);
      }}
    >
      <div class="container">
        {parent() == null ? <Draggable /> : null}
        <Droppable>
          {parent() === 'droppable' ? <Draggable /> : null}
        </Droppable>
      </div>
    </DragDropProvider>
  );
}
