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
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import {createRange} from '../../../utilities';

import {Page, Position} from './Page';
import type {Props as PageProps} from './Page';
import styles from './Pages.module.css';

export function Pages() {
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(() =>
    createRange<string>(100, (index) => `${index + 1}`)
  );
  const activeIndex = items.indexOf(activeId);
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
    >
      <SortableContext items={items}>
        <ul className={styles.Pages}>
          {items.map((id) => (
            <SortablePage id={id} key={id} activeIndex={activeIndex} />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeId ? <PageOverlay id={activeId} items={items} /> : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart({active}: DragStartEvent) {
    setActiveId(active.id);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd({over}) {
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

function PageOverlay({id, items, ...props}: PageProps & {items: string[]}) {
  const {activatorEvent, active, over} = useDndContext();
  const isKeyboardSorting = activatorEvent instanceof KeyboardEvent;
  const activeIndex = items.indexOf(active);
  const overIndex = items.indexOf(over?.id);

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
    over,
    setNodeRef,
  } = useSortable({
    id,
  });

  return (
    <Page
      ref={setNodeRef}
      id={id}
      active={isDragging}
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
