import React, {memo, useCallback, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {Feedback, PointerSensor, KeyboardSensor} from '@dnd-kit/dom';
import {DragDropEventHandlers} from '@dnd-kit/react';

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}

const ITEM_COUNT = 6;

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  accentColor: string;
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
  accentColor,
}: PropsWithChildren<SortableItemProps>) {
  const group = column;
  const {handleRef, ref, isDragging} = useSortable({
    id,
    group,
    accept: 'item',
    type: 'item',
    plugins: [Feedback.configure({feedback: 'clone'})],
    index,
    data: {group},
  });

  return (
    <div
      ref={ref as any}
      className="item"
      data-shadow={isDragging || undefined}
      data-accent-color={accentColor}
      style={{'--accent-color': accentColor} as React.CSSProperties}
    >
      {id}
      <button ref={handleRef as any} className="handle" />
    </div>
  );
});

interface SortableColumnProps {
  id: string;
  index: number;
  rows: string[];
}

const SortableColumn = memo(function SortableColumn({
  rows,
  id,
  index,
}: PropsWithChildren<SortableColumnProps>) {
  const {handleRef, isDragging, ref} = useSortable({
    id,
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
    index,
  });

  return (
    <div
      ref={ref as any}
      className="container"
      data-shadow={isDragging || undefined}
    >
      <h2>
        {id}
        <button ref={handleRef as any} className="handle" />
      </h2>
      <ul id={id} style={{'--columns': 1} as React.CSSProperties}>
        {rows.map((itemId, itemIndex) => (
          <SortableItem
            key={itemId}
            id={itemId}
            column={id}
            index={itemIndex}
            accentColor={COLORS[id]}
          />
        ))}
      </ul>
    </div>
  );
});

export default function App() {
  const [items, setItems] = useState({
    A: createRange(ITEM_COUNT).map((id) => `A${id}`),
    B: createRange(ITEM_COUNT).map((id) => `B${id}`),
    C: createRange(ITEM_COUNT).map((id) => `C${id}`),
    D: [],
  });
  const [columns] = useState(Object.keys(items));
  const snapshot = useRef(structuredClone(items));

  return (
    <DragDropProvider
      sensors={sensors}
      onDragStart={useCallback<DragDropEventHandlers['onDragStart']>(() => {
        snapshot.current = structuredClone(items);
      }, [items])}
      onDragOver={useCallback<DragDropEventHandlers['onDragOver']>((event) => {
        const {source} = event.operation;

        if (source && source.type === 'column') {
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
      <div className="wrapper">
        {columns.map((column, columnIndex) => {
          const rows = items[column as keyof typeof items];

          return (
            <SortableColumn
              key={column}
              id={column}
              index={columnIndex}
              rows={rows}
            />
          );
        })}
      </div>
    </DragDropProvider>
  );
}
