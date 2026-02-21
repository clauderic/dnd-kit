import React, {useState} from 'react';
import type {CSSProperties} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, DragOverlay} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {move} from '@dnd-kit/helpers';

import {Item} from '../../components/index.ts';
import {createRange} from '@dnd-kit/stories-shared/utilities';

const ITEM_HEIGHT = 62;

interface Props {
  debug?: boolean;
  overlay?: boolean;
}

/**
 * Sortable list where items are absolutely positioned using CSS
 * `transform: translateY()`. This mimics the positioning strategy used by
 * virtualization libraries like react-window v2 and is useful for testing
 * that @dnd-kit correctly handles elements with pre-existing CSS transforms.
 */
export function TransformedExample({debug, overlay}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(createRange(10));

  return (
    <DragDropProvider
      plugins={debug ? (defaults) => [Debug, ...defaults] : undefined}
      onDragOver={(event) => {
        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 600,
          margin: '0 auto',
          height: items.length * ITEM_HEIGHT,
        }}
      >
        {items.map((id, index) => (
          <TransformedItem
            key={id}
            id={id}
            index={index}
            overlay={overlay}
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: ITEM_HEIGHT,
              transform: `translateY(${index * ITEM_HEIGHT}px)`,
            }}
          />
        ))}
      </div>
      {overlay ? (
        <DragOverlay>
          {(source) => (
            <Item shadow={source.isDragging}>{source.id}</Item>
          )}
        </DragOverlay>
      ) : null}
    </DragDropProvider>
  );
}

interface TransformedItemProps {
  id: UniqueIdentifier;
  index: number;
  overlay?: boolean;
  style: CSSProperties;
}

function TransformedItem({id, index, overlay, style}: TransformedItemProps) {
  const {isDragSource, isDragging, ref} = useSortable({
    id,
    index,
  });

  return (
    <Item
      ref={ref}
      actions={<></>}
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
      data-index={index}
      shadow={!overlay && isDragging}
      aria-hidden={overlay ? isDragSource : undefined}
    >
      {id}
    </Item>
  );
}
