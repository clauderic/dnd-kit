import { useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';

function SortableItem({ id, index }) {
  const { ref } = useSortable({ id, index });

  return (
    <li ref={ref} className="item">
      Item {id}
    </li>
  );
}

export default function App() {
  const [items, setItems] = useState([1, 2, 3, 4]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <ul className="list">
        {items.map((id, index) => (
          <SortableItem key={id} id={id} index={index} />
        ))}
      </ul>
    </DragDropProvider>
  );
}
