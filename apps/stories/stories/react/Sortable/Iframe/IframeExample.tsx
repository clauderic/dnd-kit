import React, {useEffect, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {DragOverlay} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import AutoFrameComponent from '@measured/auto-frame-component';

import {Container, Item} from '../../components/index.ts';
import {createRange, cloneDeep} from '@dnd-kit/stories-shared/utilities';

const AutoFrame = AutoFrameComponent.default || AutoFrameComponent;

interface Props {
  debug?: boolean;
  defaultItems?: Record<string, string[]>;
  columnStyle?: Record<string, string>;
  itemCount: number;
  scrollable?: boolean;
  transform?: boolean;
}

export function IframeLists({
  debug,
  defaultItems,
  itemCount,
  columnStyle,
  scrollable,
  transform,
}: Props) {
  const [items, setItems] = useState(
    defaultItems ?? {
      host: createRange(itemCount).map((id) => `Host: ${id}`),
      iframe: createRange(itemCount).map((id) => `Iframe: ${id}`),
    }
  );
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
        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
          return;
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 20,
        }}
      >
        <Column id="host" scrollable={scrollable} style={columnStyle}>
          {items.host.map((id, index) => (
            <SortableItem key={id} id={id} column={'host'} index={index} />
          ))}
        </Column>

        <AutoFrame
          style={{
            border: 'none',
            transform: transform ? 'scale(0.8)' : undefined,
          }}
        >
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;600"
            rel="stylesheet"
          />

          <style
            dangerouslySetInnerHTML={{
              __html: 'body { background: transparent; margin: 0 !important; }',
            }}
          />
          <div className={bodyClassName}>
            <Column id="iframe" scrollable={scrollable} style={columnStyle}>
              {items.iframe.map((id, index) => (
                <SortableItem key={id} id={id} column="iframe" index={index} />
              ))}
            </Column>
          </div>
        </AutoFrame>
      </div>
      <DragOverlay>
        {(source) => <Item shadow={source.isDragging}>{source.id}</Item>}
      </DragOverlay>
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
    index,
    data: {group},
  });

  return (
    <Item
      ref={ref}
      accentColor={COLORS[column]}
      style={style}
      transitionId={`sortable-${column}-${id}`}
      aria-hidden={isDragSource}
    >
      {id}
    </Item>
  );
}

interface ColumnProps {
  id: string;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

function Column({
  children,
  id,
  scrollable,
  style,
}: PropsWithChildren<ColumnProps>) {
  return (
    <Container
      label={id.charAt(0).toUpperCase() + id.slice(1)}
      scrollable={scrollable}
      transitionId={`sortable-column-${id}`}
      style={style}
    >
      {children}
    </Container>
  );
}
