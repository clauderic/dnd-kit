import React, {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';

import {Droppable} from './Droppable';
import {Draggable} from './Draggable';

export function Example() {
  const [parent, setParent] = useState();
  const parents = ['A', 'B', 'C'];
  const draggable = <Draggable id="draggable" />;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const {target} = event.operation;

        if (event.canceled) return;

        setParent(target ? target.id : undefined);
      }}
    >
      <section>
        <div>{parent == null ? draggable : null}</div>
        {parents.map((id) => (
          <Droppable key={id} id={id}>
            {parent === id ? draggable : null}
          </Droppable>
        ))}
      </section>
    </DragDropProvider>
  );
}


