import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useSortable} from '@dnd-kit/react';
import {Debug, FeedbackType, defaultPreset} from '@dnd-kit/dom';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/state-management';

import {Item, Handle} from '../components';
import {createRange, cloneDeep} from '../../utilities';

interface Props {
  debug?: boolean;
  ghost?: boolean;
  heights?: number | Record<UniqueIdentifier, number>;
  horizontal?: boolean;
  itemCount?: number;
  widths?: number | Record<UniqueIdentifier, number>;
}

export function SortableExample({
  debug,
  itemCount = 15,
  ghost,
  horizontal,
  heights,
  widths,
}: Props) {
  const [items, setItems] = useState(createRange(itemCount));
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      plugins={debug ? [Debug, ...defaultPreset.plugins] : undefined}
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
          <Sortable
            key={id}
            id={id}
            index={index}
            style={getStyle(id)}
            feedback={ghost ? 'clone' : 'default'}
          />
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
  feedback?: FeedbackType;
  style?: React.CSSProperties;
}

function Sortable({
  id,
  index,
  feedback,
  style,
}: PropsWithChildren<SortableProps>) {
  const [element, setElement] = useState<Element | null>(null);
  const activatorRef = useRef<HTMLButtonElement | null>(null);

  const {isDragSource} = useSortable({
    id,
    index,
    element,
    feedback,
    activator: activatorRef,
    collisionDetector: directionBiased,
  });

  return (
    <Item
      ref={setElement}
      actions={<Handle ref={activatorRef} />}
      shadow={isDragSource}
      style={style}
    >
      {id}
    </Item>
  );
}
