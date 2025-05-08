import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {flushSync} from 'react-dom';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {defaultPreset, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {supportsViewTransition} from '@dnd-kit/dom/utilities';
import {DragDropEventHandlers} from '@dnd-kit/react';

import {
  Actions,
  Container,
  Item,
  Handle,
  Remove,
} from '../../components/index.ts';
import {createRange} from '../../../utilities/createRange.ts';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';

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

export function MultipleLists({
  debug,
  defaultItems,
  grid,
  itemCount,
  columnStyle,
  rtl,
  scrollable,
  vertical,
}: Props) {
  const [items, setItems] = useState(
    defaultItems ?? {
      A: createRange(itemCount).map((id) => `A${id}`),
      B: createRange(itemCount).map((id) => `B${id}`),
      C: createRange(itemCount).map((id) => `C${id}`),
      D: [],
    }
  );
  const [columns] = useState(Object.keys(items));
  const snapshot = useRef(cloneDeep(items));
  const handleRemoveItem = useCallback((id: string, column: string) => {
    const remove = () =>
      setItems((items) => ({
        ...items,
        [column]: items[column].filter((item) => item !== id),
      }));

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(remove));
    } else {
      remove();
    }
  }, []);

  return (
    <DragDropProvider
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
      sensors={sensors}
      onDragStart={useCallback<DragDropEventHandlers['onDragStart']>(() => {
        snapshot.current = cloneDeep(items);
      }, [items])}
      onDragOver={useCallback<DragDropEventHandlers['onDragOver']>((event) => {
        const {source} = event.operation;

        if (source?.type === 'column') {
          // We can rely on optimistic sorting for columns
          return;
        }

        setItems((items) => move(items, event));
      }, [])}
      onDragEnd={useCallback<DragDropEventHandlers['onDragEnd']>((event) => {
        if (event.canceled) {
          setItems(snapshot.current);
          return;
        }
      }, [])}
    >
      {rtl ? <style>{`:root { direction: rtl; }`}</style> : null}
      <div
        style={{
          display: grid ? 'grid' : 'flex',
          width: grid ? '60%' : undefined,
          gridTemplateColumns: grid ? '1fr 1fr' : undefined,
          alignItems: vertical ? 'center' : undefined,
          margin: grid ? '0 auto' : undefined,
          flexDirection: vertical ? 'column' : 'row',
          gap: 20,
        }}
      >
        {columns.map((column, columnIndex) => {
          const rows = items[column];

          return (
            <SortableColumn
              key={column}
              id={column}
              index={columnIndex}
              columns={grid ? 2 : 1}
              scrollable={scrollable}
              style={columnStyle}
              rows={rows}
              onRemove={handleRemoveItem}
            />
          );
        })}
      </div>
    </DragDropProvider>
  );
}

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: React.CSSProperties;
  onRemove?: (id: string, column: string) => void;
}

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

const SortableItem = memo(function SortableItem({
  id,
  column,
  index,
  style,
  onRemove,
}: PropsWithChildren<SortableItemProps>) {
  const group = column;
  const {handleRef, ref, isDragging} = useSortable({
    id,
    group,
    accept: 'item',
    type: 'item',
    feedback: 'clone',
    index,
    data: {group},
  });

  return (
    <Item
      ref={ref}
      actions={
        <Actions>
          {onRemove && !isDragging ? (
            <Remove onClick={() => onRemove(id, column)} />
          ) : null}
          <Handle ref={handleRef} />
        </Actions>
      }
      accentColor={COLORS[column]}
      shadow={isDragging}
      style={style}
      transitionId={`sortable-${column}-${id}`}
    >
      {id}
    </Item>
  );
});

interface SortableColumnProps {
  columns: number;
  id: string;
  index: number;
  scrollable?: boolean;
  style?: React.CSSProperties;
  rows: string[];
  onRemove?: SortableItemProps['onRemove'];
}

const SortableColumn = memo(function SortableColumn({
  rows,
  columns,
  id,
  index,
  scrollable,
  style,
  onRemove,
}: PropsWithChildren<SortableColumnProps>) {
  const {handleRef, isDragging, ref} = useSortable({
    id,
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
    index,
  });
  const actions = useMemo(() => {
    return (
      <Actions>
        <Handle ref={handleRef} />
      </Actions>
    );
  }, [handleRef]);
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      onRemove?.(itemId, id);
    },
    [id, onRemove]
  );

  return (
    <Container
      ref={ref}
      label={`${id}`}
      actions={actions}
      columns={columns}
      shadow={isDragging}
      scrollable={scrollable}
      transitionId={`sortable-column-${id}`}
      style={style}
    >
      {rows.map((itemId, index) => (
        <SortableItem
          key={itemId}
          id={itemId}
          column={id}
          index={index}
          onRemove={handleRemoveItem}
          style={columns === 2 ? {height: 100} : undefined}
        />
      ))}
    </Container>
  );
});
