import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {arrayMove} from '@dnd-kit/utilities';

import {Item, Handle} from '../components';
import {createRange, cloneDeep} from '../../utilities';

interface Props {
  horizontal?: boolean;
  itemCount?: number;
  heights?: number | Record<UniqueIdentifier, number>;
  widths?: number | Record<UniqueIdentifier, number>;
}

export function SortableExample({
  itemCount = 15,
  horizontal,
  heights,
  widths,
}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(
    createRange(itemCount)
  );
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (!source || !target) {
          return;
        }

        const sourceIndex = items.indexOf(source.id);
        const targetIndex = items.indexOf(target.id);

        if (sourceIndex !== targetIndex) {
          setItems((items) => arrayMove(items, sourceIndex, targetIndex));
        }
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
        }
      }}
    >
      <div
        style={{
          display: horizontal ? 'inline-flex' : 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          alignItems: horizontal ? 'stretch' : 'center',
          height: horizontal ? 180 : undefined,
          gap: 20,
          padding: '0 30px',
        }}
      >
        {items.map((id, index) => (
          <Sortable key={id} id={id} index={index} style={getStyle(id)} />
        ))}
      </div>
    </DragDropProvider>
  );

  function getStyle(id: UniqueIdentifier) {
    return {
      width:
        typeof widths === 'number'
          ? widths
          : widths?.[id] ?? widths?.['default'],
      height:
        typeof heights === 'number'
          ? heights
          : heights?.[id] ?? heights?.['default'],
    };
  }
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
  style?: React.CSSProperties;
}

function Sortable({id, index, style}: PropsWithChildren<SortableProps>) {
  const [element, setElement] = useState<Element | null>(null);
  const activatorRef = useRef<HTMLButtonElement | null>(null);

  const {isDragSource} = useSortable({
    id,
    index,
    element,
    activator: activatorRef,
  });

  return (
    <Item
      ref={setElement}
      shadow={isDragSource}
      actions={<Handle ref={activatorRef} />}
      style={style}
    >
      {id}
    </Item>
  );
}
