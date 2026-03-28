import { createSignal, Show } from 'solid-js';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/solid';

function Draggable() {
  const { ref } = useDraggable({ id: 'draggable' });

  return (
    <button ref={ref} class="draggable">
      Drag me
    </button>
  );
}

function Droppable(props: { children?: any }) {
  const { ref, isDropTarget } = useDroppable({ id: 'droppable' });

  return (
    <div ref={ref} class={`droppable ${isDropTarget() ? 'active' : ''}`}>
      {props.children || 'Drop here'}
    </div>
  );
}

export default function App() {
  const [parent, setParent] = createSignal<string | undefined>(undefined);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id as string | undefined);
      }}
    >
      <div class="container">
        <Show when={parent() == null}>
          <Draggable />
        </Show>
        <Droppable>
          <Show when={parent() === 'droppable'}>
            <Draggable />
          </Show>
        </Droppable>
      </div>
    </DragDropProvider>
  );
}
