import { createSignal } from 'solid-js';
import { DragDropProvider } from '@dnd-kit/solid';

import { Droppable } from './Droppable';
import { Draggable } from './Draggable';

export function Example() {
  const [parent, setParent] = createSignal();
  const draggable = () => <Draggable id="draggable" />;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const { target } = event.operation;
        if (event.canceled) return;
        setParent(target ? target.id : undefined);
      }}
    >
      <section>
        <div>{parent() == null ? draggable() : null}</div>
        <Droppable id="dropzone">
          {parent() === 'dropzone' ? draggable() : null}
        </Droppable>
      </section>
    </DragDropProvider>
  );
}


