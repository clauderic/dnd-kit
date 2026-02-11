import React, {useRef, useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

function Sortable({id, index}: {id: number; index: number}) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {isDragging} = useSortable({id, index, element, handle: handleRef});

  return (
    <li ref={setElement} className="item" data-shadow={isDragging || undefined}>
      {id}
      <button ref={handleRef} className="handle" />
    </li>
  );
}

export default function App() {
  const [items, setItems] = useState(createRange(100));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <ul className="list">
        {items.map((id, index) => (
          <Sortable key={id} id={id} index={index} />
        ))}
      </ul>
    </DragDropProvider>
  );
}

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}
