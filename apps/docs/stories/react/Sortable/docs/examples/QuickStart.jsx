import React, {useState} from 'react';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {move} from '@dnd-kit/utilities';

export function Example({vertical}) {
  const [items, setItems] = useState([0, 1, 2, 3]);

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (source && target) {
          setItems((items) =>
            move(items, source.id, target.id)
          );
        }
      }}
    >
      <div style={{display: 'inline-flex', flexDirection: vertical ? 'column' : 'row', gap: 20}}>
        {items.map((id, index) => (
          <Sortable key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

function Sortable({id, index}) {
  const {ref} = useSortable({id, index});

  return (
    <button ref={ref}>
      Item {id}
    </button>
  );
}
