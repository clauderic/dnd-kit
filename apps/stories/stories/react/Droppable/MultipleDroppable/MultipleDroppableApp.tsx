import React, {useState} from 'react';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';

function Draggable({id}: {id: string}) {
  const {ref} = useDraggable({id});

  return <button ref={ref} className="btn">draggable</button>;
}

function Droppable({id, children}: {id: string; children?: React.ReactNode}) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <div ref={ref} className={isDropTarget ? "droppable active" : "droppable"}>
      {children}
    </div>
  );
}

export default function App() {
  const [parent, setParent] = useState<string | undefined>(undefined);
  const draggable = <Draggable id="draggable" />;
  const droppables = ['A', 'B', 'C'];

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id as string);
      }}
    >
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 500, margin: '0 auto'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {parent == null ? draggable : null}
        </div>
        {droppables.map((id) => (
          <Droppable key={id} id={id}>
            {parent === id ? draggable : null}
          </Droppable>
        ))}
      </div>
    </DragDropProvider>
  );
}
