import React, {useState, useEffect} from 'react';
import {createPortal} from 'react-dom';

import {
  arrayMove,
  useSortable,
  useSortableSensors,
  SortableContext,
  SortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  PointerActivationConstraint,
  DraggableClone,
  DndContext,
  closestCenter,
  UniqueIdentifier,
  Modifiers,
} from '@dnd-kit/core';

import {createRange} from '../utilities';
import {Item, List} from '../components';

export interface Props {
  activationConstraint?: PointerActivationConstraint;
  adjustScale?: boolean;
  Container?: any; // TO-DO: Fix me
  strategy?: SortingStrategy;
  itemCount?: number;
  items?: string[];
  renderItem?: any;
  handle?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isClone: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    index: number;
    isDragging: boolean;
    id: string;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
  translateModifiers?: Modifiers;
  useClone?: boolean;
}

export function Sortable({
  activationConstraint,
  adjustScale = false,
  Container = List,
  strategy = verticalListSortingStrategy,
  itemCount = 16,
  items: parentItems,
  renderItem,
  handle = false,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  isDisabled = () => false,
  translateModifiers,
  useClone = true,
}: Props) {
  const [items, setItems] = useState<string[]>(
    () =>
      parentItems ?? createRange<string>(itemCount, (index) => index.toString())
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSortableSensors({
    strategy,
    mouse: {
      options: {
        activationConstraint,
      },
    },
    touch: {
      options: {
        activationConstraint,
      },
    },
    keyboard: {
      options: {
        // For automated Cypress integration tests, we don't need the smooth animation
        scrollBehavior: 'Cypress' in window ? 'auto' : 'smooth',
      },
    },
  });
  const getIndex = items.indexOf.bind(items);
  const activeIndex = activeId ? getIndex(activeId) : -1;

  useEffect(
    () => {
      if (parentItems) {
        setItems(parentItems);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    parentItems ? [...parentItems] : []
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({active}) => {
        if (!active) {
          return;
        }

        setActiveId(active.id);
      }}
      onDragMove={() => {}}
      onDragEnd={({over}) => {
        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => arrayMove(items, activeIndex, overIndex));
          }
        }

        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
      translateModifiers={translateModifiers}
    >
      <SortableContext id="container" items={items} strategy={strategy}>
        <Container>
          {items.map((value, index) => (
            <SortableItem
              key={value}
              id={value}
              handle={handle}
              index={index}
              style={getItemStyles}
              wrapperStyle={wrapperStyle}
              disabled={isDisabled(value)}
              renderItem={renderItem}
              useClone={useClone}
            />
          ))}
        </Container>
      </SortableContext>
      {useClone
        ? createPortal(
            <DraggableClone adjustScale={adjustScale}>
              {activeId ? (
                <Item
                  value={items[activeIndex]}
                  handle={handle}
                  renderItem={renderItem}
                  wrapperStyle={wrapperStyle({
                    index: activeIndex,
                    isDragging: true,
                    id: items[activeIndex],
                  })}
                  style={getItemStyles({
                    id: items[activeIndex],
                    index: activeIndex,
                    isSorting: activeId !== null,
                    isDragging: true,
                    overIndex: -1,
                    isClone: true,
                  })}
                  clone
                />
              ) : null}
            </DraggableClone>,
            document.body
          )
        : null}
    </DndContext>
  );
}

interface SortableItemProps {
  disabled?: boolean;
  id: string;
  index: number;
  handle: boolean;
  useClone?: boolean;
  style(values: any): React.CSSProperties;
  renderItem?(args: any): React.ReactElement;
  wrapperStyle({
    index,
    isDragging,
    id,
  }: {
    index: number;
    isDragging: boolean;
    id: string;
  }): React.CSSProperties;
}

export function SortableItem({
  disabled,
  id,
  index,
  handle,
  style,
  renderItem,
  useClone,
  wrapperStyle,
}: SortableItemProps) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    transform,
  } = useSortable({
    id,
    disabled,
  });

  return (
    <Item
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      renderItem={renderItem}
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting,
        overIndex,
      })}
      wrapperStyle={wrapperStyle({index, isDragging, id})}
      transform={transform}
      listeners={listeners}
      data-index={index}
      data-id={id}
      clone={!useClone && isDragging}
      {...attributes}
    />
  );
}
