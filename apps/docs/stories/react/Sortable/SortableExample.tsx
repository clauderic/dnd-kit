import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {arrayMove} from '@dnd-kit/utilities';

import {Item, Handle} from '../components';
import {createRange, cloneDeep} from '../../utilities';

interface Props {
  itemCount?: number;
}

export function SortableExample({itemCount = 15}: Props) {
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {items.map((id, index) => (
          <Sortable key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
}

function Sortable({id, index}: PropsWithChildren<SortableProps>) {
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
    >
      {id}
    </Item>
  );
}
