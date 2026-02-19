import React, {useState, memo} from 'react';
import type {PropsWithChildren} from 'react';
import type {Axis} from '@dnd-kit/geometry';
import {AutoScroller} from '@dnd-kit/dom';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {directionBiased} from '@dnd-kit/collision';

import {Item} from '../../components/index.ts';
import {createRange} from '@dnd-kit/stories-shared/utilities';

interface Props {
  itemCount?: number;
  acceleration?: number;
  threshold?: number | Record<Axis, number>;
}

export function AutoScrollExample({
  itemCount = 100,
  acceleration,
  threshold,
}: Props) {
  const [items, setItems] = useState(createRange(itemCount));

  const plugins =
    acceleration != null || threshold != null
      ? (defaults: any) => [
          ...defaults,
          AutoScroller.configure({acceleration, threshold}),
        ]
      : undefined;

  return (
    <DragDropProvider
      plugins={plugins}
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '0 30px'}}>
        {items.map((id, index) => (
          <SortableItem key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

const SortableItem = memo(function SortableItem({
  id,
  index,
}: PropsWithChildren<{id: number; index: number}>) {
  const [element, setElement] = useState<Element | null>(null);
  const {isDragging} = useSortable({
    id,
    index,
    element,
    collisionDetector: directionBiased,
  });

  return (
    <Item ref={setElement} shadow={isDragging}>
      {id}
    </Item>
  );
});
