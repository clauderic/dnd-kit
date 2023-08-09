import React, {useState} from 'react';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {arrayMove} from '@dnd-kit/utilities';

export function Example({vertical}) {
  const [items, setItems] = useState([0, 1, 2, 3]);

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (source && target && source.id !== target.id) {
          setItems((items) =>
            arrayMove(items, items.indexOf(source.id), items.indexOf(target.id))
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
    <button ref={ref} style={{padding: '10px 20px'}}>
      Item {id}
    </button>
  );
}
