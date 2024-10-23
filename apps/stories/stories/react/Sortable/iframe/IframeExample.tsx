import React, {useEffect, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import AutoFrameComponent from '@measured/auto-frame-component';

import {Actions, Container, Item, Handle} from '../../components/index.ts';
import {createRange} from '../../../utilities/createRange.ts';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';

const AutoFrame = AutoFrameComponent.default || AutoFrameComponent;

interface Props {
  debug?: boolean;
  grid?: boolean;
  defaultItems?: Record<string, string[]>;
  columnStyle?: Record<string, string>;
  itemCount: number;
  scrollable?: boolean;
  vertical?: boolean;
}

export function IframeLists({
  debug,
  defaultItems,
  grid,
  itemCount,
  columnStyle,
  scrollable,
  vertical,
}: Props) {
  const [items, setItems] = useState(
    defaultItems ?? {
      Host: createRange(itemCount).map((id) => `Host: ${id}`),
      Iframe: createRange(itemCount).map((id) => `Iframe: ${id}`),
      Transformed: createRange(itemCount).map((id) => `Transformed: ${id}`),
    }
  );
  const [columns, setColumns] = useState(Object.keys(items));
  const snapshot = useRef(cloneDeep(items));

  const [bodyClassName, setBodyClassName] = useState('');

  useEffect(() => {
    const body = document.querySelector('body');

    if (!body) return;

    if (body.classList.contains('dark')) {
      setBodyClassName('dark');
    }
  }, []);

  return (
    <DragDropProvider
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const {source} = event.operation;

        if (source?.type === 'column') {
          // We can rely on optimistic sorting for columns
          return;
        }

        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
          return;
        }

        const {source} = event.operation;

        if (source?.type === 'column') {
          setColumns((columns) => move(columns, event));
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
        <SortableColumn
          id={columns[0]}
          index={0}
          columns={grid ? 2 : 1}
          scrollable={scrollable}
          style={columnStyle}
        >
          {items[columns[0]].map((id, index) => (
            <SortableItem
              key={id}
              id={id}
              column={columns[0]}
              index={index}
              style={grid ? {height: 100} : undefined}
            />
          ))}
        </SortableColumn>

        <AutoFrame style={{border: 'none'}}>
          <style
            dangerouslySetInnerHTML={{
              __html: 'body { background: transparent; margin: 0 !important; }',
            }}
          />
          <div className={bodyClassName}>
            <SortableColumn
              id={columns[1]}
              index={1}
              columns={grid ? 2 : 1}
              scrollable={scrollable}
              style={columnStyle}
            >
              {items[columns[1]].map((id, index) => (
                <SortableItem
                  key={id}
                  id={id}
                  column={columns[1]}
                  index={index}
                  style={grid ? {height: 100} : undefined}
                />
              ))}
            </SortableColumn>
          </div>
        </AutoFrame>
      </div>
    </DragDropProvider>
  );
}

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: React.CSSProperties;
}

const COLORS: Record<string, string> = {
  Host: '#7193f1',
  Iframe: '#FF851B',
  Transformed: '#2ECC40',
};

function SortableItem({
  id,
  column,
  index,
  style,
}: PropsWithChildren<SortableItemProps>) {
  const group = column;
  const {ref, isDragSource} = useSortable({
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
      accentColor={COLORS[column]}
      shadow={isDragSource}
      style={style}
      transitionId={`sortable-${column}-${id}`}
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
  style?: React.CSSProperties;
}

function SortableColumn({
  children,
  columns,
  id,
  index,
  scrollable,
  style,
}: PropsWithChildren<SortableColumnProps>) {
  const {handleRef, isDragSource, ref} = useSortable({
    id,
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
    index,
  });

  return (
    <Container
      ref={ref}
      label={`${id}`}
      actions={
        <Actions>
          <Handle ref={handleRef} />
        </Actions>
      }
      columns={columns}
      shadow={isDragSource}
      scrollable={scrollable}
      transitionId={`sortable-column-${id}`}
      style={style}
    >
      {children}
    </Container>
  );
}
