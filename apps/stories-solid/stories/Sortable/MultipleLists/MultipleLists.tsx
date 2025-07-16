import { createEffect, createMemo, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { DragDropProvider, useSortable } from '@dnd-kit/solid';
import { move } from '@dnd-kit/helpers';
import { defaultPreset, PointerSensor, KeyboardSensor } from '@dnd-kit/dom';
import { Debug } from '@dnd-kit/dom/plugins/debug';
import { CollisionPriority } from '@dnd-kit/abstract';

import { Actions } from '../../../components/Actions/Actions';
import { Handle } from '../../../components/Actions/Handle';
import { Remove } from '../../../components/Actions/Remove';
import { Item } from '../../../components/Item/Item';
import { Container } from '../../../components/Item/Container';

import { createRange } from '../../../utilities/createRange';
import { cloneDeep } from '../../../utilities/cloneDeep';
import { supportsViewTransition } from '@dnd-kit/dom/utilities';

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
  C: '#ff3680',
};

export function MultipleLists(props: Props) {
  const [items, setItems] = createStore<Record<string, string[]>>(
    props.defaultItems ?? {
      A: createRange(props.itemCount).map((id) => `A${id}`),
      B: createRange(props.itemCount).map((id) => `B${id}`),
      C: [],
    }
  );
  // Use a plain object for snapshot
  let snapshot: Record<string, string[]> = {};

  function handleRemoveItem(id: string, column: string) {
    const remove = () => setItems(
      column, 
      (list) => {
        return list.filter((item) => item !== id)
      }
    );
    
    if (supportsViewTransition(document)) {
      document.startViewTransition(() => remove());
    } else {
      remove();
    }
  }

  function handleDragStart(event: any) {
    snapshot = cloneDeep(items);
  }

  function handleDragOver(event: any) {
    const { source, target } = event.operation;
    
    if (source?.type === 'column' || target?.type === 'column') {
      return;
    }
    
    console.log('dragover', move(cloneDeep(items), event), event);
    
    // move returns a new object, so we need to set the store with the new object
    // setItems(move(items, event));
  }

  function handleDragEnd(event: any) {
    if (event.canceled) {
      setItems(snapshot);
    }
    else {
      debugger;
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
        class={
          (props.grid
            ? 'grid w-3/5 grid-cols-2 mx-auto'
            : 'flex') +
          ' gap-5' +
          (props.vertical ? ' flex-col items-center' : ' flex-row')
        }
      >
        <For each={Object.entries(items)}>
          {([column, rows], columnIndex) => {
            return (
              <SortableColumn
                id={column}
                rows={rows}
                index={columnIndex()}
                columns={props.grid ? 2 : 1}
                scrollable={props.scrollable}
                style={props.columnStyle}
                onRemove={handleRemoveItem}
              />
            );
          }}
        </For>
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
      accentColor={COLORS[props.column]}
      shadow={isDragging()}
      style={props.style}
      transitionId={`sortable-${props.column}-${props.id}`}
    >
      <div>
        {props.id}
      </div>
      
      <Actions>
        <Show when={props.onRemove && !isDragging()}>
          <Remove onClick={() => props.onRemove?.(props.id, props.column)} />
        </Show>
        
        <Handle ref={handleRef} />
      </Actions>
    </Item>
  );
}

interface SortableColumnProps {
  columns: number;
  id: string;
  index: number;
  scrollable?: boolean;
  style?: Record<string, string>;
  rows: string[];
  onRemove?: (id: string, column: string) => void;
}

function SortableColumn(props: SortableColumnProps) {
  const { handleRef, isDragging, ref } = useSortable({
    id: props.id,
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
    index: props.index,
  });


  // Use Container for columns, matching React
  return (
    <Container
      ref={ref}
      label={props.id}
      actions={
        <Actions>
          <Handle ref={handleRef} />
        </Actions>
      }
      columns={props.columns}
      shadow={isDragging()}
      scrollable={props.scrollable}
      transitionId={`sortable-column-${props.id}`}
      style={props.style}
    >
      <For each={props.rows}>{(itemId, index) => (
        <SortableItem
          id={itemId}
          column={props.id}
          index={index()}
          onRemove={ () => props.onRemove?.(itemId, props.id)}
          style={props.columns === 2 ? { height: '100px' } : undefined}
        />
      )}</For>
    </Container>
  );
}
