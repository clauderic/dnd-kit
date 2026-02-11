import {createSignal} from 'solid-js';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/solid';

function Draggable() {
  const {ref} = useDraggable({id: 'draggable'});

  return <button ref={ref} class="btn">draggable</button>;
}

function Droppable(props: {children?: any}) {
  const {isDropTarget, ref} = useDroppable({id: 'droppable'});

  return (
    <div ref={ref} class={isDropTarget() ? 'droppable active' : 'droppable'}>
      {props.children}
    </div>
  );
}

export default function App() {
  const [parent, setParent] = createSignal<string | undefined>();

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id as string);
      }}
    >
      <section style="display:grid;grid-template-columns:2fr 1fr;gap:20px;align-items:center;max-width:700px;margin:0 auto">
        <div style="display:flex;justify-content:center">
          {parent() == null ? <Draggable /> : null}
        </div>
        <Droppable>
          {parent() === 'droppable' ? <Draggable /> : null}
        </Droppable>
      </section>
    </DragDropProvider>
  );
}
