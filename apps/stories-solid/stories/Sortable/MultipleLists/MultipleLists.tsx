import { createSignal, createMemo, createEffect, For, Show } from 'solid-js';
import { DragDropProvider, useSortable } from '@dnd-kit/solid';
import { move } from '@dnd-kit/helpers';
import { defaultPreset, PointerSensor, KeyboardSensor } from '@dnd-kit/dom';
import { Debug } from '@dnd-kit/dom/plugins/debug';
import { CollisionPriority, type DragDropManager, type Draggable, type Droppable, type UniqueIdentifier } from '@dnd-kit/abstract';

import { Actions } from '../../../components/Actions/Actions';
import { Handle } from '../../../components/Actions/Handle';
import { Remove } from '../../../components/Actions/Remove';
import { Item } from '../../../components/Item/Item';

import { createRange } from '../../../utilities/createRange';
import { cloneDeep } from '../../../utilities/cloneDeep';
import { SortableDroppable, type Sortable } from '@dnd-kit/dom/sortable';

interface Props {
  debug?: boolean;
  grid?: boolean;
  defaultItems?: Record<string, string[]>;
  columnStyle?: Record<string, string>;
  itemCount: number;
  rtl?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};


function sortByIndex(a: Sortable, b: Sortable) {
  return a.index - b.index;
}

function sort(instances: Set<Sortable>) {
  return Array.from(instances).sort(sortByIndex);
}

const getSortableInstances = (manager: DragDropManager<Draggable, Droppable>) => {
  const sortableInstances = new Map<
    UniqueIdentifier | undefined,
    Set<Sortable>
  >();

  for (const droppable of manager.registry.droppables) {
    if (droppable instanceof SortableDroppable) {
      const {sortable} = droppable;
      const {group} = sortable;

      let instances = sortableInstances.get(group);

      if (!instances) {
        instances = new Set();
        sortableInstances.set(group, instances);
      }

      instances.add(sortable);
    }
  }

  for (const [group, instances] of sortableInstances) {
    sortableInstances.set(group, new Set(sort(instances)));
  }

  return sortableInstances;
};

export function MultipleLists(props: Props) {
  const [items, setItems] = createSignal(
    props.defaultItems ?? {
      A: createRange(props.itemCount).map((id) => `A${id}`),
      B: createRange(props.itemCount).map((id) => `B${id}`),
      C: createRange(props.itemCount).map((id) => `C${id}`),
      D: [],
    }
  );
  const columns = createMemo(() => Object.keys(items()));
  let snapshot = cloneDeep(items());

  function handleRemoveItem(id: string, column: string) {
    setItems((prev) => ({
      ...prev,
      [column]: prev[column].filter((item) => item !== id),
    }));
  }

  function handleDragStart(event: any) {
    snapshot = cloneDeep(items());
        const instances = getSortableInstances(event.operation.source.manager);
    
    debugger;
    
  }

  function handleDragOver(event: any) {
    const { source } = event.operation;
    if (source?.type === 'column') {
      // We can rely on optimistic sorting for columns
      return;
    }
    setItems((prev) => move(prev, event));
  }

  function handleDragEnd(event: any) {
    if (event.canceled) {
      setItems(snapshot);
      return;
    }
  }

  return (
    <DragDropProvider
      plugins={props.debug ? [...defaultPreset.plugins, Debug] : undefined}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Show when={props.rtl}>
        <style>{`:root { direction: rtl; }`}</style>
      </Show>
      
      <div
        style={{
          display: props.grid ? 'grid' : 'flex',
          width: props.grid ? '60%' : undefined,
          'grid-template-columns': props.grid ? '1fr 1fr' : undefined,
          'align-items': props.vertical ? 'center' : undefined,
          margin: props.grid ? '0 auto' : undefined,
          'flex-direction': props.vertical ? 'column' : 'row',
          gap: '20px',
        }}
      >
        <For each={columns()}>{(column, columnIndex) => {
          const rows = items()[column];
          return (
            <SortableColumn
              id={column}
              index={columnIndex()}
              columns={props.grid ? 2 : 1}
              scrollable={props.scrollable}
              style={props.columnStyle}
              rows={rows}
              onRemove={handleRemoveItem}
            />
          );
        }}</For>
      </div>
    </DragDropProvider>
  );
}

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: any;
  onRemove?: (id: string, column: string) => void;
}

function SortableItem(props: SortableItemProps) {
  const { handleRef, ref, isDragging } = useSortable({
    id: props.id,
    group: props.column,
    accept: 'item',
    type: 'item',
    feedback: 'clone',
    index: props.index,
    data: { group: props.column },
  });

  return (
    <Item
      ref={ref}
      actions={
        <Actions>
          <Show when={props.onRemove && !isDragging()}>
            <Remove onClick={() => props.onRemove?.(props.id, props.column)} />
          </Show>
          <Handle ref={handleRef} />
        </Actions>
      }
      accentColor={COLORS[props.column]}
      shadow={isDragging()}
      style={props.style}
      transitionId={`sortable-${props.column}-${props.id}`}
    >
      {props.id}
    </Item>
  );
}

interface SortableColumnProps {
  columns: number;
  id: string;
  index: number;
  scrollable?: boolean;
  style?: any;
  rows: string[];
  onRemove?: (id: string, column: string) => void;
}

function SortableColumn(props: SortableColumnProps) {
  const { handleRef, isDragging, ref } = useSortable({
    id: props.id,
    accept: ['column'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
    index: props.index,
  });

  function handleRemoveItem(itemId: string) {
    props.onRemove?.(itemId, props.id);
  }

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flex: 1,
        'flex-direction': 'column',
        'align-items': 'stretch',
        'box-shadow': isDragging() ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
        'background': '#fff',
        'border-radius': '5px',
        'margin': '8px',
        ...props.style,
      }}
    >
      <div style={{ display: 'flex', 'align-items': 'center', 'padding': '8px 20px', 'border-bottom': '1px solid #eee' }}>
        {props.id}
        <Actions>
          <Handle ref={handleRef} />
        </Actions>
      </div>
      <div style={{ display: 'grid', gap: '16px', 'grid-template-columns': `repeat(${props.columns}, 1fr)`, padding: '15px' }}>
        <For each={props.rows}>{(itemId, index) => (
          <SortableItem
            id={itemId}
            column={props.id}
            index={index()}
            onRemove={handleRemoveItem}
            style={props.columns === 2 ? { height: '100px' } : undefined}
          />
        )}</For>
      </div>
    </div>
  );
}
