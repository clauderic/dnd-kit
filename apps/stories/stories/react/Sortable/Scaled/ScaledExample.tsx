import React, {useState} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

import {Item} from '../../components/index.ts';
import {createRange} from '@dnd-kit/stories-shared/utilities';

// A long transition makes the sorting animation easy to observe and to test
const transition = {duration: 2000, easing: 'linear'};

/**
 * Sortable list rendered inside an ancestor with `transform: scale(2)`, like
 * a zoomable canvas or diagram. Sorting animations must not overshoot.
 */
export function ScaledExample() {
  const [items, setItems] = useState<UniqueIdentifier[]>(createRange(5));

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div
        data-testid="scaled-container"
        style={{
          width: 240,
          transform: 'scale(2)',
          transformOrigin: 'top left',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {items.map((id, index) => (
          <ScaledItem key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

function ScaledItem({id, index}: {id: UniqueIdentifier; index: number}) {
  const {ref, isDragging} = useSortable({id, index, transition});

  return (
    <Item ref={ref} actions={<></>} shadow={isDragging}>
      {id}
    </Item>
  );
}
