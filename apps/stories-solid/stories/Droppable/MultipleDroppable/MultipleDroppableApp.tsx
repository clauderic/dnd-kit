import {createSignal, For} from 'solid-js';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/solid';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return <button ref={ref} class="btn">draggable</button>;
}

function Droppable(props: {id: string; children?: any}) {
  const {isDropTarget, ref} = useDroppable({id: props.id});

  return (
    <div ref={ref} class={isDropTarget() ? 'droppable active' : 'droppable'}>
      {props.children}
    </div>
  );
}

export default function App() {
  const [parent, setParent] = createSignal<string | undefined>();
  const droppables = ['A', 'B', 'C'];

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id as string);
      }}
    >
      <div style={{display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '20px', 'max-width': '500px', margin: '0 auto'}}>
        <div style={{display: 'flex', 'align-items': 'center', 'justify-content': 'center'}}>
          {parent() == null ? <Draggable /> : null}
        </div>
        <For each={droppables}>
          {(id) => (
            <Droppable id={id}>
              {parent() === id ? <Draggable /> : null}
            </Droppable>
          )}
        </For>
      </div>
    </DragDropProvider>
  );
}
