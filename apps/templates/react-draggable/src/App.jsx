import { useState } from 'react';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';

function Draggable() {
  const { ref } = useDraggable({ id: 'draggable' });

  return (
    <button ref={ref} className="draggable">
      Drag me
    </button>
  );
}

function Droppable({ children }) {
  const { isDropTarget, ref } = useDroppable({ id: 'droppable' });

  return (
    <div ref={ref} className={`droppable ${isDropTarget ? 'active' : ''}`}>
      {children || 'Drop here'}
    </div>
  );
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
