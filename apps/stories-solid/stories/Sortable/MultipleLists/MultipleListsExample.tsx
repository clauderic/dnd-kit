import {createSignal, For} from 'solid-js';
import {CollisionPriority} from '@dnd-kit/abstract';
import {PointerSensor, KeyboardSensor, DragDropProvider} from '@dnd-kit/solid';
import {useSortable} from '@dnd-kit/solid/sortable';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {move} from '@dnd-kit/helpers';
import {createRange, cloneDeep} from '@dnd-kit/stories-shared/utilities';

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
    get id() { return props.id; },
    get index() { return props.index; },
    get group() { return props.column; },
    get data() { return {group: props.column}; },
    accept: 'item',
    type: 'item',
    feedback: 'clone',
  });

  return (
    <div
      ref={ref}
      class="Item"
      data-shadow={isDragging() ? 'true' : undefined}
      data-accent-color={props.column}
      style={{'--accent-color': COLORS[props.column]}}
    >
      {props.id}
      <handle-component ref={handleRef} />
    </div>
  );
}

function SortableColumn(props: {id: string; index: number; rows: string[]}) {
  const {isDragging, ref, handleRef} = useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
  });

  return (
    <container-component
      ref={ref}
      attr:data-shadow={isDragging() ? 'true' : undefined}
    >
      <div class="Header">
        {props.id}
        <handle-component ref={handleRef} />
      </div>
      <ul style={{"list-style": 'none', padding: '15px', margin: '0', display: 'grid', gap: '16px'}}>
        <For each={props.rows}>
          {(itemId, itemIndex) => (
            <SortableItem id={itemId} column={props.id} index={itemIndex()} />
          )}
        </For>
      </ul>
    </container-component>
  );
}

export function MultipleListsExample(props: {itemCount?: number; debug?: boolean}) {
  const itemCount = () => props.itemCount ?? 5;

  const [items, setItems] = createSignal<Record<string, string[]>>({
    A: createRange(itemCount()).map((id) => `A${id}`),
    B: createRange(itemCount()).map((id) => `B${id}`),
    C: createRange(itemCount()).map((id) => `C${id}`),
    D: [],
  });

  const columns = Object.keys(items());
  let snapshot = cloneDeep(items());

  return (
    <DragDropProvider
      plugins={props.debug ? [...defaultPreset.plugins, Debug] : undefined}
      sensors={sensors}
      onDragStart={() => {
        snapshot = cloneDeep(items());
      }}
      onDragOver={(event) => {
        const {source} = event.operation;
        if (source?.type === 'column') return;
        event.preventDefault();
        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot);
        }
      }}
    >
      <div style={{display: 'flex', "flex-direction": 'row', gap: '20px'}}>
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
