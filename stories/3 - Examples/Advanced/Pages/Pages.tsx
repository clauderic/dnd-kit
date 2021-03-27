import React, {useState} from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDndContext,
  LayoutMeasuringStrategy,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import classNames from 'classnames';

import {createRange} from '../../../utilities';

import {Page, Layout, Position} from './Page';
import type {Props as PageProps} from './Page';
import styles from './Pages.module.css';

interface Props {
  layout: Layout;
}

const layoutMeasuring = {
  strategy: LayoutMeasuringStrategy.Always,
};

export function Pages({layout}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(() =>
    createRange<string>(20, (index) => `${index + 1}`)
  );
  const activeIndex = activeId ? items.indexOf(activeId) : -1;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      collisionDetection={closestCenter}
      layoutMeasuring={layoutMeasuring}
    >
      <SortableContext items={items}>
        <ul className={classNames(styles.Pages, styles[layout])}>
          {items.map((id, index) => (
            <SortablePage
              id={id}
              index={index + 1}
              key={id}
              layout={layout}
              activeIndex={activeIndex}
              onRemove={() =>
                setItems((items) => items.filter((itemId) => itemId !== id))
              }
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <PageOverlay id={activeId} layout={layout} items={items} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart({active}: DragStartEvent) {
    setActiveId(active.id);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd({over}: DragEndEvent) {
    if (over) {
      const overIndex = items.indexOf(over.id);

      if (activeIndex !== overIndex) {
        const newIndex = overIndex;

        setItems((items) => arrayMove(items, activeIndex, newIndex));
      }
    }

    setActiveId(null);
  }
}

function PageOverlay({
  id,
  items,
  ...props
}: Omit<PageProps, 'index'> & {items: string[]}) {
  const {activatorEvent, over} = useDndContext();
  const isKeyboardSorting = activatorEvent instanceof KeyboardEvent;
  const activeIndex = items.indexOf(id);
  const overIndex = over?.id ? items.indexOf(over?.id) : -1;

  return (
    <Page
      id={id}
      {...props}
      clone
      insertPosition={
        isKeyboardSorting && overIndex !== activeIndex
          ? overIndex > activeIndex
            ? Position.After
            : Position.Before
          : undefined
      }
    />
  );
}

function SortablePage({
  id,
  activeIndex,
  ...props
}: PageProps & {activeIndex: number}) {
  const {
    attributes,
    listeners,
    index,
    isDragging,
    isSorting,
    over,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges: always,
  });

  return (
    <Page
      ref={setNodeRef}
      id={id}
      active={isDragging}
      style={{
        transition,
        transform: isSorting ? undefined : CSS.Translate.toString(transform),
      }}
      insertPosition={
        over?.id === id
          ? index > activeIndex
            ? Position.After
            : Position.Before
          : undefined
      }
      {...props}
      {...attributes}
      {...listeners}
    />
  );
}

function always() {
  return true;
}
