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
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import {createRange} from '../../../utilities';

import {Page} from './Page';
import type {Props as PageProps} from './Page';
import styles from './Pages.module.css';

export function Pages() {
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(() =>
    createRange<string>(100, (index) => `${index + 1}`)
  );
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
            <SortablePage id={id} key={id} />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeId ? <Page id={activeId} clone /> : null}
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
      const activeIndex = items.indexOf(activeId);

      if (activeIndex !== overIndex) {
        setItems((items) => arrayMove(items, activeIndex, overIndex));
      }
    }

    setActiveId(null);
  }
}

function SortablePage({id, ...props}: PageProps) {
  const {attributes, listeners, isDragging, over, setNodeRef} = useSortable({
    id,
  });

  return (
    <Page
      ref={setNodeRef}
      id={id}
      active={isDragging}
      over={over?.id === id}
      {...props}
      {...attributes}
      {...listeners}
    />
  );
}
