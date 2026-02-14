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
      style={{'aspect-ratio': '1', 'justify-content': 'center'}}
    >
      {props.id}
    </div>
  );
}

export default function App() {
  const [items, setItems] = createSignal(createRange(10));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={{display: 'inline-flex', 'flex-direction': 'row', 'align-items': 'stretch', height: '180px', gap: '18px', padding: '0 30px'}}>
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
