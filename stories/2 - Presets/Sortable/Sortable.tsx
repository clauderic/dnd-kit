import React, {useState} from 'react';
import {createPortal} from 'react-dom';

import {
  Announcements,
  closestCenter,
  CollisionDetection,
  DragOverlay,
  DndContext,
  KeyboardSensor,
  Modifiers,
  MouseSensor,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import {createRange} from '../../utilities';
import {Item, List, Wrapper} from '../../components';

export interface Props {
  activationConstraint?: PointerActivationConstraint;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  Container?: any; // To-do: Fix me
  strategy?: SortingStrategy;
  itemCount?: number;
  items?: string[];
  renderItem?: any;
  handle?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    index: number;
    isDragging: boolean;
    id: string;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
  modifiers?: Modifiers;
  useDragOverlay?: boolean;
}

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export function Sortable({
  activationConstraint,
  adjustScale = false,
  Container = List,
  collisionDetection = closestCenter,
  strategy = rectSortingStrategy,
  itemCount = 16,
  items: initialItems,
  renderItem,
  handle = false,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  isDisabled = () => false,
  modifiers,
  useDragOverlay = true,
}: Props) {
  const [items, setItems] = useState<string[]>(
    () =>
      initialItems ??
      createRange<string>(itemCount, (index) => index.toString())
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const getIndex = items.indexOf.bind(items);
  const getPosition = (id: string) => getIndex(id) + 1;
  const activeIndex = activeId ? getIndex(activeId) : -1;

  const announcements: Announcements = {
    onDragStart(id) {
      return `Picked up sortable item ${id}. Sortable item ${id} is in position ${getPosition(
        id
      )} of ${items.length}`;
    },
    onDragOver(id, overId) {
      if (overId) {
        return `Sortable item ${id} was moved into position ${getPosition(
          overId
        )} of ${items.length}`;
      }

      return;
    },
    onDragEnd(id, overId) {
      if (overId) {
        return `Sortable item ${id} was dropped at position ${getPosition(
          overId
        )} of ${items.length}`;
      }

      return;
    },
    onDragCancel(id) {
      return `Dragging was cancelled. Sortable item ${id} was dropped.`;
    },
  };

  return (
    <DndContext
      announcements={announcements}
      screenReaderInstructions={screenReaderInstructions}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        if (!active) {
          return;
        }

        setActiveId(active.id);
      }}
      onDragEnd={({over}) => {
        setActiveId(null);

        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => arrayMove(items, activeIndex, overIndex));
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
      modifiers={modifiers}
    >
      <Wrapper center>
        <SortableContext items={items} strategy={strategy}>
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
                useDragOverlay={useDragOverlay}
              />
            ))}
          </Container>
        </SortableContext>
      </Wrapper>
      {useDragOverlay
        ? createPortal(
            <DragOverlay adjustScale={adjustScale}>
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
                    isDragOverlay: true,
                  })}
                  dragOverlay
                />
              ) : null}
            </DragOverlay>,
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
  useDragOverlay?: boolean;
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
  useDragOverlay,
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
    transition,
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
      transform={transform}
      transition={!useDragOverlay && isDragging ? 'none' : transition}
      wrapperStyle={wrapperStyle({index, isDragging, id})}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
    />
  );
}
