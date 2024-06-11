import React, {useState} from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider, useDroppable} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

import {Item} from './Item';

const styles = {display: 'inline-flex', flexDirection: 'row', gap: 20};

export function Guide({
  style = styles,
  disabled = false,
  uncontrolled = false,
  sortableColumns = false,
}) {
  const [items, setItems] = useState({
    A: ['A0', 'A1', 'A2'],
    B: ['B0', 'B1'],
    C: [],
  });

  return (
    <DragDropProvider
      onDragOver={(event) => {
        if (uncontrolled) {
          return;
        }

        const {source, target} = event.operation;

        if (source && target) {
          setItems((items) => move(items, source, target));
        }
      }}
    >
      <div style={style}>
        {Object.entries(items).map(([column, items], columnIndex) => (
          <Column
            key={column}
            id={column}
            index={columnIndex}
            sortable={sortableColumns}
          >
            {items.map((id, index) =>
              disabled ? (
                <button>{id}</button>
              ) : (
                <Item
                  key={id}
                  id={id}
                  index={index}
                  column={column}
                  disabled={disabled}
                />
              )
            )}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
}

export function Column({children, id, index, sortable}) {
  const useHook = sortable ? useSortable : useDroppable;
  const {ref} = useHook({
    id,
    index,
    type: 'column',
    accept: ['item', 'column'],
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 20,
        minWidth: 200,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        cursor: sortable ? 'grab' : undefined,
      }}
      ref={ref}
    >
      {children}
    </div>
  );
}
