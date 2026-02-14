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
      style={{height: '100%', justifyContent: 'center'}}
    >
      {id}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(createRange(20));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 150px)', gridAutoRows: 150, gridAutoFlow: 'dense', gap: 18, padding: '0 30px', maxWidth: 900, marginInline: 'auto', justifyContent: 'center'}}>
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
