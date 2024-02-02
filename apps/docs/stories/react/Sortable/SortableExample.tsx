import React, {useRef, useState} from 'react';
import type {CSSProperties, PropsWithChildren} from 'react';
import type {
  CollisionDetector,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/abstract';
import {FeedbackType, defaultPreset} from '@dnd-kit/dom';
import type {SortableTransition} from '@dnd-kit/dom/sortable';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/helpers';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {Item, Handle} from '../components';
import {createRange, cloneDeep} from '../../utilities';

interface Props {
  debug?: boolean;
  dragHandle?: boolean;
  disabled?: UniqueIdentifier[];
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  layout?: 'vertical' | 'horizontal' | 'grid';
  transition?: SortableTransition;
  itemCount?: number;
  collisionDetector?: CollisionDetector;
  getItemStyle?(id: UniqueIdentifier, index: number): CSSProperties;
}

export function SortableExample({
  debug,
  itemCount = 15,
  collisionDetector,
  disabled,
  dragHandle,
  feedback,
  layout = 'vertical',
  modifiers,
  transition,
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
            disabled={disabled?.includes(id)}
            dragHandle={dragHandle}
            feedback={feedback}
            transition={transition}
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
  collisionDetector?: CollisionDetector;
  disabled?: boolean;
  dragHandle?: boolean;
  feedback?: FeedbackType;
  transition?: SortableTransition;
  style?: React.CSSProperties;
}

function SortableItem({
  id,
  index,
  collisionDetector = directionBiased,
  disabled,
  dragHandle,
  feedback,
  transition,
  style,
}: PropsWithChildren<SortableProps>) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const {isDragSource} = useSortable({
    id,
    index,
    element,
    feedback,
    transition,
    handle: handleRef,
    disabled,
    collisionDetector,
  });

  return (
    <Item
      ref={setElement}
      actions={dragHandle ? <Handle ref={handleRef} /> : null}
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
    gap: 18,
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
