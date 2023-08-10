import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {arrayMove} from '@dnd-kit/utilities';

import {Item, Handle} from '../../components';
import {createRange, cloneDeep} from '../../../utilities';

interface Props {
  itemCount?: number;
}

export function MultipleContainers({itemCount = 5}: Props) {
  const [items, setItems] = useState<Record<string, UniqueIdentifier[]>>({
    A: createRange(itemCount).map((id) => `A${id}`),
    B: createRange(itemCount).map((id) => `B${id}`),
    C: createRange(itemCount).map((id) => `C${id}`),
  });
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event, manager) => {
        const {source, target} = event.operation;

        if (!source?.data || !target?.data) {
          return;
        }

        const {column} = source.data;
        const {column: targetColumn} = target.data;

        const sourceIndex = items[column].indexOf(source.id);
        const targetIndex = items[targetColumn].indexOf(target.id);

        if (column !== targetColumn) {
          setItems((items) => ({
            ...items,
            [column]: items[column].filter((item) => item !== source.id),
            [targetColumn]: [
              ...items[targetColumn]
                .filter((item) => item !== source.id)
                .slice(0, targetIndex),
              source.id,
              ...items[targetColumn]
                .filter((item) => item !== source.id)
                .slice(targetIndex),
            ],
          }));
        } else if (sourceIndex !== targetIndex) {
          setItems((items) => ({
            ...items,
            [column]: arrayMove(items[column], sourceIndex, targetIndex),
          }));
        }
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
            }}
          >
            {rows.map((id, index) => (
              <Sortable key={id} id={id} column={column} index={index} />
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
}

function Sortable({id, column, index}: PropsWithChildren<SortableProps>) {
  const {activatorRef, ref, isDragSource} = useSortable({
    id,
    data: {column},
    index,
  });

  return (
    <Item
      ref={ref}
      shadow={isDragSource}
      actions={<Handle ref={activatorRef} />}
      style={{width: 250}}
    >
      {id}
    </Item>
  );
}
