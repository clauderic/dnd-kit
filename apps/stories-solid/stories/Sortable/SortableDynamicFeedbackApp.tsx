import {createSignal, For} from 'solid-js';
import {Feedback} from '@dnd-kit/dom';
import {DragDropProvider} from '@dnd-kit/solid';
import {useSortable} from '@dnd-kit/solid/sortable';
import {move} from '@dnd-kit/helpers';

const dynamicFeedbackPlugin = Feedback.configure({
  feedback: (_source, manager) =>
    manager.dragOperation.activatorEvent instanceof KeyboardEvent
      ? 'clone'
      : 'default',
});

function Sortable(props: {id: number; index: number}) {
  const {isDragging, ref} = useSortable({
    get id() {
      return props.id;
    },
    get index() {
      return props.index;
    },
    plugins: [dynamicFeedbackPlugin],
  });

  return (
    <li ref={ref} class="item" data-shadow={isDragging() ? '' : undefined}>
      {props.id}
    </li>
  );
}

export default function App() {
  const [items, setItems] = createSignal(createRange(100));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <ul class="list">
        <For each={items()}>
          {(id, index) => <Sortable id={id} index={index()} />}
        </For>
      </ul>
    </DragDropProvider>
  );
}

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}
