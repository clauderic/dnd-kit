import React from 'react';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return <button ref={ref} className="btn">draggable</button>;
}

export default function App() {
  return (
    <DragDropProvider>
      <Draggable />
    </DragDropProvider>
  );
}
