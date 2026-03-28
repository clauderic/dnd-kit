import {useState} from 'react';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';
import {Droppable} from './Droppable';
import './styles.css';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});
  return <button ref={ref} className="btn">draggable</button>;
}

export default function App() {
  const [parent, setParent] = useState(undefined);
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id);
      }}
    >
      <div className="container">
        {parent == null ? <Draggable /> : null}
        <Droppable>
          {parent === 'droppable' ? <Draggable /> : null}
        </Droppable>
      </div>
    </DragDropProvider>
  );
}
