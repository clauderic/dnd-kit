import {createSignal, For} from 'solid-js';
import {DragDropProvider} from '@dnd-kit/solid';
import {useSortable} from '@dnd-kit/solid/sortable';
import {move} from '@dnd-kit/helpers';

function Sortable(props: {id: number; index: number}) {
  const {isDragging, ref} = useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
  });

  return (
    <div
      ref={ref}
      class="item"
      data-shadow={isDragging() ? '' : undefined}
      style={{height: '100%', 'justify-content': 'center'}}
    >
      {props.id}
    </div>
  );
}

export default function App() {
  const [items, setItems] = createSignal(createRange(20));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={{display: 'grid', 'grid-template-columns': 'repeat(auto-fill, 150px)', 'grid-auto-rows': '150px', 'grid-auto-flow': 'dense', gap: '18px', padding: '0 30px', 'max-width': '900px', 'margin-inline': 'auto', 'justify-content': 'center'}}>
        <For each={items()}>
          {(id, index) => <Sortable id={id} index={index()} />}
        </For>
      </div>
    </DragDropProvider>
  );
}

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}
