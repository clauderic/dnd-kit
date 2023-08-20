import React, {useRef, useState} from 'react';
import type {CSSProperties, PropsWithChildren} from 'react';
import type {
  CollisionDetector,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {FeedbackType, defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/state-management';

import {Item, Handle} from '../components';
import {createRange, cloneDeep} from '../../utilities';

interface Props {
  debug?: boolean;
  dragHandle?: boolean;
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  layout?: 'vertical' | 'horizontal' | 'grid';
  itemCount?: number;
  collisionDetector?: CollisionDetector;
  getItemStyle?(id: UniqueIdentifier, index: number): CSSProperties;
}

export function SortableExample({
  debug,
  itemCount = 15,
  collisionDetector,
  dragHandle,
  feedback,
  layout = 'vertical',
  modifiers,
  getItemStyle,
}: Props) {
  const [items, setItems] = useState(createRange(itemCount));
  const snapshot = useRef(cloneDeep(items));

  return (
    <DragDropProvider
      plugins={debug ? [Debug, ...defaultPreset.plugins] : undefined}
      modifiers={modifiers}
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
      <Wrapper layout={layout}>
        {items.map((id, index) => (
          <SortableItem
            key={id}
            id={id}
            index={index}
            collisionDetector={collisionDetector}
            dragHandle={dragHandle}
            feedback={feedback}
            style={getItemStyle?.(id, index)}
          />
        ))}
      </Wrapper>
    </DragDropProvider>
  );
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
  dragHandle?: boolean;
  feedback?: FeedbackType;
  collisionDetector?: CollisionDetector;
  style?: React.CSSProperties;
}

function SortableItem({
  id,
  index,
  collisionDetector = directionBiased,
  dragHandle,
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
    collisionDetector,
  });

  return (
    <Item
      ref={setElement}
      actions={dragHandle ? <Handle ref={activatorRef} /> : null}
      shadow={isDragSource}
      style={style}
    >
      {id}
    </Item>
  );
}

function Wrapper({
  layout,
  children,
}: PropsWithChildren<{layout: 'vertical' | 'horizontal' | 'grid'}>) {
  return <div style={getWrapperStyles(layout)}>{children}</div>;
}

function getWrapperStyles(
  layout: 'vertical' | 'horizontal' | 'grid'
): CSSProperties {
  const baseStyles: CSSProperties = {
    gap: 20,
    padding: '0 30px',
  };

  switch (layout) {
    case 'grid':
      return {
        ...baseStyles,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, max-content)',
        justifyContent: 'center',
      };
    case 'horizontal':
      return {
        ...baseStyles,
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        height: 180,
      };
    case 'vertical':
      return {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      };
  }
}
