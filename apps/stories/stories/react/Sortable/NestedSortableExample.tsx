import React, {useRef, useState} from 'react';
import type {CSSProperties, PropsWithChildren} from 'react';
import type {
  CollisionDetector,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/abstract';
import {FeedbackType, defaultPreset} from '@dnd-kit/dom';
import {type SortableTransition} from '@dnd-kit/dom/sortable';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {directionBiased} from '@dnd-kit/collision';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {Item, Handle} from '../components/index.ts';
import {cloneDeep} from '../../utilities/cloneDeep.ts';

interface Props {
  debug?: boolean;
  dragHandle?: boolean;
  disabled?: UniqueIdentifier[];
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  layout?: 'vertical' | 'horizontal' | 'grid';
  transition?: SortableTransition;
  optimistic?: boolean;
  collisionDetector?: CollisionDetector;
  getItemStyle?(id: UniqueIdentifier, index: number): CSSProperties;
}

function deepMove(_items: ItemData[], fromId: string, toId: string) {
  const items = cloneDeep(_items);

  type ItemRef = {
    item: ItemData;
    parentItems: ItemData[];
    index: number;
  };

  const flatList: ItemRef[] = [];

  function flatten(items: ItemData[]) {
    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];
      flatList.push({
        item: currentItem,
        parentItems: items,
        index: i,
      });

      if (currentItem.items?.length) {
        flatten(currentItem.items);
      }
    }
  }

  flatten(items);

  const fromRef = flatList.find((ref) => ref.item.id === fromId);
  const toRef = flatList.find((ref) => ref.item.id === toId);

  if (!fromRef || !toRef || fromRef.item === toRef.item) {
    return items;
  }

  const moveAbove = flatList.indexOf(fromRef) > flatList.indexOf(toRef);

  fromRef.parentItems.splice(fromRef.index, 1);

  let insertionIndex = toRef.parentItems.indexOf(toRef.item);
  if (!moveAbove) {
    insertionIndex += 1;
  }

  toRef.parentItems.splice(insertionIndex, 0, fromRef.item);

  return items;
}

export function NestedSortableExample({
  debug,
  collisionDetector,
  disabled,
  dragHandle,
  feedback,
  layout = 'vertical',
  optimistic = true,
  modifiers,
  transition,
  getItemStyle,
}: Props) {
  const [items, setItems] = useState<ItemData[]>([
    {id: '1'},
    {id: '2'},
    {
      items: [{id: '3a'}, {id: '3b'}],
      id: '3',
    },
  ]);

  return (
    <DragDropProvider
      plugins={debug ? [Debug, ...defaultPreset.plugins] : undefined}
      modifiers={modifiers}
      onDragOver={(event) => {
        if (optimistic) return;

        // Prevent optimistic re-render
        event.preventDefault();

        const {operation} = event;
        const {source, target} = operation;

        if (source && target) {
          setItems(deepMove(items, source.id, target.id));
        }
      }}
      onDragEnd={(event) => {
        const {operation} = event;
        const {source, target} = operation;

        if (source && target) {
          setItems(deepMove(items, source.id, target.id));
        }
      }}
    >
      <Wrapper layout={layout}>
        {items.map((item, index) => (
          <SortableItem
            key={item.id}
            item={item}
            index={index}
            collisionDetector={collisionDetector}
            disabled={disabled?.includes(item.id)}
            dragHandle={dragHandle}
            feedback={feedback}
            optimistic={optimistic}
            transition={transition}
            style={getItemStyle?.(item.id, index)}
          />
        ))}
      </Wrapper>
    </DragDropProvider>
  );
}

interface ItemData {
  id: string;
  items?: ItemData[];
}

interface SortableItemProps {
  item: ItemData;
  index: number;
  collisionDetector?: CollisionDetector;
  disabled?: boolean;
  dragHandle?: boolean;
  feedback?: FeedbackType;
  optimistic?: boolean;
  transition?: SortableTransition;
  style?: React.CSSProperties;
}

function SortableItem({
  item,
  index,
  collisionDetector = directionBiased,
  disabled,
  dragHandle,
  feedback,
  transition,
  optimistic,
  style,
}: PropsWithChildren<SortableItemProps>) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {isDragging} = useSortable({
    id: item.id,
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
      shadow={isDragging}
      style={style}
    >
      {item.id}
      {item.items && (
        <Wrapper layout="vertical">
          {item.items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              collisionDetector={collisionDetector}
              disabled={disabled}
              dragHandle={dragHandle}
              feedback={feedback}
              optimistic={optimistic}
              transition={transition}
              style={style}
            />
          ))}
        </Wrapper>
      )}
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
        gridTemplateColumns: 'repeat(2, max-content)',
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
