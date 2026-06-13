import React, {memo, useEffect, useState} from 'react';
import type {CSSProperties, PropsWithChildren} from 'react';
import {AutoScroller, Feedback} from '@dnd-kit/dom';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/helpers';
import type {Customizable, Plugins, UniqueIdentifier} from '@dnd-kit/abstract';

import {Handle, Item} from '../../components/index.ts';
import {createRange} from '@dnd-kit/stories-shared/utilities';

interface Props {
  itemCount?: number;
  preventSiblingScroll?: boolean;
  testIdPrefix?: string;
}

export function ScrollableItemsExample({
  itemCount = 8,
  preventSiblingScroll,
  testIdPrefix = 'scrollable-item',
}: Props) {
  const [items, setItems] = useState(() => createRange(itemCount));

  useEffect(() => {
    setItems(createRange(itemCount));
  }, [itemCount]);
  const plugins: Customizable<Plugins> | undefined = preventSiblingScroll
    ? (defaults) => [
        ...defaults,
        AutoScroller.configure({
          shouldScroll({manager, scrollable, source, target}) {
            if (
              manager.dragOperation.source !== source ||
              manager.dragOperation.target !== target
            ) {
              return false;
            }

            return (
              source?.element?.contains(scrollable) ||
              !scrollable.classList.contains('Item')
            );
          },
        }),
      ]
    : undefined;

  return (
    <DragDropProvider
      plugins={plugins}
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={wrapperStyles}>
        {items.map((id, index) => (
          <ScrollableSortableItem
            key={id}
            id={id}
            index={index}
            testIdPrefix={testIdPrefix}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}

interface SortableItemProps {
  id: UniqueIdentifier;
  index: number;
  testIdPrefix: string;
}

const ScrollableSortableItem = memo(function ScrollableSortableItem({
  id,
  index,
  testIdPrefix,
}: PropsWithChildren<SortableItemProps>) {
  const {handleRef, isDragging, ref} = useSortable({
    id,
    index,
    collisionDetector: directionBiased,
    plugins: (defaults) => [
      ...defaults,
      Feedback.configure({feedback: 'clone'}),
    ],
  });

  return (
    <Item
      ref={ref}
      actions={<Handle ref={handleRef} />}
      data-testid={`${testIdPrefix}-${id}`}
      shadow={isDragging}
      style={itemStyles}
    >
      <div style={contentStyles}>
        <strong style={titleStyles}>Item {id}</strong>
        <div style={rowsStyles}>
          {createRange(14).map((row) => (
            <span key={row} style={rowStyles}>
              Detail {row}
            </span>
          ))}
        </div>
      </div>
    </Item>
  );
});

const wrapperStyles: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  padding: '30px',
};

const itemStyles: CSSProperties = {
  alignItems: 'stretch',
  height: 150,
  maxWidth: 420,
  overflowAnchor: 'none',
  overflowY: 'auto',
  padding: 0,
};

const contentStyles: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 12,
  minWidth: 0,
  padding: '16px 20px',
};

const titleStyles: CSSProperties = {
  color: '#222',
  fontSize: 15,
  fontWeight: 600,
};

const rowsStyles: CSSProperties = {
  display: 'grid',
  gap: 8,
};

const rowStyles: CSSProperties = {
  background: '#f5f6fa',
  borderRadius: 4,
  color: '#666',
  display: 'block',
  padding: '8px 10px',
};
