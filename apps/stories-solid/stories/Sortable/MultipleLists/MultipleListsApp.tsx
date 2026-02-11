import {createSignal, For} from 'solid-js';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/solid';
import {useSortable} from '@dnd-kit/solid/sortable';
import {defaultPreset, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';
import {move} from '@dnd-kit/helpers';

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}

const ITEM_COUNT = 6;

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

function SortableItem(props: {id: string; column: string; index: number}) {
  const {isDragging, ref, handleRef} = useSortable({
    get id() {
      return props.id;
    },
    get index() {
      return props.index;
    },
    get group() {
      return props.column;
    },
    get data() {
      return {group: props.column};
    },
    accept: 'item',
    type: 'item',
    feedback: 'clone',
  });

  return (
    <li
      ref={ref}
      class="item"
      data-shadow={isDragging() ? 'true' : undefined}
      data-accent-color={props.column}
      style={{'--accent-color': COLORS[props.column]}}
    >
      {props.id}
      <button ref={handleRef} class="handle" />
    </li>
  );
}

function SortableColumn(props: {id: string; index: number; rows: string[]}) {
  const {isDragging, ref, handleRef} = useSortable({
    get id() {
      return props.id;
    },
    get index() {
      return props.index;
    },
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
  });

  return (
    <div
      ref={ref}
      class="container"
      data-shadow={isDragging() ? 'true' : undefined}
    >
      <h2>
        {props.id}
        <button ref={handleRef} class="handle" />
      </h2>
      <ul>
        <For each={props.rows}>
          {(itemId, itemIndex) => (
            <SortableItem id={itemId} column={props.id} index={itemIndex()} />
          )}
        </For>
      </ul>
    </div>
  );
}

export default function App() {
  const [items, setItems] = createSignal<Record<string, string[]>>({
    A: createRange(ITEM_COUNT).map((id) => `A${id}`),
    B: createRange(ITEM_COUNT).map((id) => `B${id}`),
    C: createRange(ITEM_COUNT).map((id) => `C${id}`),
    D: [],
  });

  const columns = Object.keys(items());
  let snapshot = structuredClone(items());

  return (
    <DragDropProvider
      plugins={defaultPreset.plugins}
      sensors={sensors}
      onDragStart={() => {
        snapshot = structuredClone(items());
      }}
      onDragOver={(event) => {
        const {source} = event.operation;
        if (source && source.type === 'column') return;
        event.preventDefault();
        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot);
        }
      }}
    >
      <div class="wrapper">
        <For each={columns}>
          {(column, columnIndex) => (
            <SortableColumn
              id={column}
              index={columnIndex()}
              rows={items()[column]}
            />
          )}
        </For>
      </div>
    </DragDropProvider>
  );
}
