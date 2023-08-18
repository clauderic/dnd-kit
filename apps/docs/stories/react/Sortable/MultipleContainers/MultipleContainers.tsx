import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {move} from '@dnd-kit/state-management';
import {Debug, DragDropManager, defaultPreset} from '@dnd-kit/dom';

import {Actions, Container, Item, Handle, Remove} from '../../components';
import {createRange, cloneDeep} from '../../../utilities';
import {CollisionPriority} from '@dnd-kit/abstract';

interface Props {
  debug?: boolean;
  grid?: boolean;
  itemCount: number;
  scrollable?: boolean;
  vertical?: boolean;
}

export function MultipleContainers({
  debug,
  grid,
  itemCount,
  scrollable,
  vertical,
}: Props) {
  const [items, setItems] = useState({
    A: createRange(itemCount).map((id) => `A${id}`),
    B: createRange(itemCount).map((id) => `B${id}`),
    C: createRange(itemCount).map((id) => `C${id}`),
    D: [],
  });
  const [columns, setColumns] = useState(Object.keys(items));
  const manager = useRef<DragDropManager>(null);
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      ref={manager}
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (!source || !target || source.id === target.id) {
          return;
        }

        if (source.type === 'column') {
          setColumns((columns) => move(columns, source, target));
          return;
        }

        setItems((items) => move(items, source, target));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
        }
      }}
    >
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
        {columns.map((column, columnIndex) => (
          <SortableColumn
            key={column}
            id={column}
            index={columnIndex}
            columns={grid ? 2 : 1}
            scrollable={scrollable}
          >
            {items[column].map((id, index) => (
              <SortableItem
                key={id}
                id={id}
                column={column}
                index={index}
                onRemove={(id) => {
                  setItems((items) => ({
                    ...items,
                    [column]: items[column].filter((item) => item !== id),
                  }));
                }}
                style={grid ? {height: 100} : undefined}
              />
            ))}
          </SortableColumn>
        ))}
      </div>
    </DragDropProvider>
  );
}

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: React.CSSProperties;
  onRemove?: (id: string) => void;
}

const COLORS = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

function SortableItem({
  id,
  column,
  index,
  style,
  onRemove,
}: PropsWithChildren<SortableItemProps>) {
  const {activatorRef, ref, isDragSource} = useSortable({
    id,
    accept: 'item',
    type: 'item',
    feedback: 'clone',
    index,
  });

  return (
    <Item
      ref={ref}
      actions={
        <Actions>
          {onRemove && !isDragSource ? (
            <Remove onClick={() => onRemove(id)} />
          ) : null}
          <Handle ref={activatorRef} />
        </Actions>
      }
      accentColor={COLORS[column]}
      shadow={isDragSource}
      style={style}
    >
      {id}
    </Item>
  );
}

interface SortableColumnProps {
  columns: number;
  id: string;
  index: number;
  scrollable?: boolean;
}

function SortableColumn({
  children,
  columns,
  id,
  index,
  scrollable,
}: PropsWithChildren<SortableColumnProps>) {
  const {activatorRef, isDragSource, ref} = useSortable({
    id,
    accept: ['column', 'item'],
    // Prioritize item collisions over column collisions.
    collisionPriority: CollisionPriority.Lowest,
    type: 'column',
    index,
  });

  return (
    <Container
      ref={ref}
      label={`${id}`}
      columns={columns}
      actions={
        <Actions>
          <Handle ref={activatorRef} />
        </Actions>
      }
      shadow={isDragSource}
      scrollable={scrollable}
    >
      {children}
    </Container>
  );
}
