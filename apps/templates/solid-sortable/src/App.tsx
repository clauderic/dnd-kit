import {createSignal, For} from 'solid-js';
import {DragDropProvider} from '@dnd-kit/solid';
import {useSortable} from '@dnd-kit/solid/sortable';
import {move} from '@dnd-kit/helpers';
import './styles.css';

function SortableItem(props) {
  const {ref} = useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
  });

  return <li ref={ref} class="item">Item {props.id}</li>;
}

export default function App() {
  const [items, setItems] = createSignal([1, 2, 3, 4]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <ul class="list">
        <For each={items()}>
          {(id, index) => <SortableItem id={id} index={index()} />}
        </For>
      </ul>
    </DragDropProvider>
  );
}
