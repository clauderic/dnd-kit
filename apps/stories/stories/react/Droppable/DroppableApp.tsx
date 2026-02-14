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

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id as string);
      }}
    >
      <section className="drop-layout">
        {parent == null ? draggable : null}
        <Droppable id="droppable">
          {parent === 'droppable' ? draggable : null}
        </Droppable>
      </section>
    </DragDropProvider>
  );
}
