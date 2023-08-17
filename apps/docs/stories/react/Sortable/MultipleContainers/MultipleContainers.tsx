import React, {useRef, useState, useTransition} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {move} from '@dnd-kit/utilities';
import {Debug, defaultPreset} from '@dnd-kit/dom';

import {Actions, Item, Handle, Remove} from '../../components';
import {createRange, cloneDeep} from '../../../utilities';

interface Props {
  debug?: boolean;
  itemCount: number;
}

export function MultipleContainers({debug, itemCount}: Props) {
  const [items, setItems] = useState<Record<string, UniqueIdentifier[]>>({
    A: createRange(itemCount).map((id) => `A${id}`),
    B: createRange(itemCount).map((id) => `B${id}`),
    C: createRange(itemCount).map((id) => `C${id}`),
  });
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const {source, target} = event.operation;

        if (!source || !target) {
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
      <div style={{display: 'flex', flexDirection: 'row', gap: 20}}>
        {Object.entries(items).map(([column, rows]) => (
          <div
            key={column}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              padding: '0 30px',
              width: 300,
            }}
          >
            {rows.map((id, index) => (
              <Sortable
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
              />
            ))}
          </div>
        ))}
      </div>
    </DragDropProvider>
  );
}

interface SortableProps {
  id: UniqueIdentifier;
  column: string;
  index: number;
  onRemove?: (id: UniqueIdentifier) => void;
}

const COLORS = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
};

function Sortable({
  id,
  column,
  index,
  onRemove,
}: PropsWithChildren<SortableProps>) {
  const {activatorRef, ref, isDragSource} = useSortable({
    id,
    accept: ['item'],
    type: 'item',
    feedback: 'clone',
    data: {column},
    index,
  });

  return (
    <Item
      ref={ref}
      actions={
        <Actions>
          {onRemove ? <Remove onClick={() => onRemove(id)} /> : null}
          <Handle ref={activatorRef} />
        </Actions>
      }
      accentColor={COLORS[column]}
      shadow={isDragSource}
    >
      {id}
    </Item>
  );
}
