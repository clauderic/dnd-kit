import React, {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

function Sortable({id, index}: {id: number; index: number}) {
  const [element, setElement] = useState<Element | null>(null);
  const {isDragging} = useSortable({id, index, element});

  return (
    <div
      ref={setElement}
      className="item"
      data-shadow={isDragging || undefined}
      style={{aspectRatio: '1', justifyContent: 'center'}}
    >
      {id}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(createRange(10));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={{display: 'inline-flex', flexDirection: 'row', alignItems: 'stretch', height: 180, gap: 18, padding: '0 30px'}}>
        {items.map((id, index) => (
          <Sortable key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}
