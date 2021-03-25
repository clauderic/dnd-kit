import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {getProjection, flattenTree, buildTree} from './utilities';
import type {FlattenedItem, SensorContext, TreeItems} from './types';
import {sortableTreeKeyboardCoordinates} from './keyboardCoordinates';
import {TreeItem, SortableTreeItem} from './components';

export default {
  title: 'Examples/Tree/Vertical',
};

const initialItems: TreeItems = [
  {
    id: 'Home',
    children: [],
  },
  {
    id: 'Collections',
    children: [
      {id: 'Summer', children: []},
      {id: 'Fall', children: []},
      {id: 'Winter', children: []},
    ],
  },
  {
    id: 'About Us',
    children: [],
  },
  {
    id: 'My Account',
    children: [
      {id: 'Addresses', children: []},
      {id: 'Order History', children: []},
    ],
  },
];

const STEP = 50;

function SortableTree() {
  const [items, setItems] = useState(() => initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [overId, setOverId] = useState(null);
  const flattenedItems = useMemo(
    () =>
      flattenTree(items).filter(({parentId}) => {
        if (activeId != null && parentId === activeId) {
          return false;
        }

        return true;
      }),
    [activeId, items]
  );
  const projected = activeId
    ? getProjection(flattenedItems, activeId, overId, offsetLeft, STEP)
    : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, STEP)
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(() => flattenedItems.map(({id}) => id), [
    flattenedItems,
  ]);
  const activeItem = activeId
    ? flattenedItems.find(({id}) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  return (
    <div
      style={{
        maxWidth: 600,
        padding: 10,
        margin: '100px auto',
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortedIds}
          strategy={verticalListSortingStrategy}
        >
          {flattenedItems.map(({id, children, depth}) => (
            <SortableTreeItem
              key={id}
              id={id}
              items={flattenedItems}
              value={id}
              depth={id === activeId ? projected.depth : depth}
              childCount={children ? children.length : 0}
              step={STEP}
            />
          ))}
          <DragOverlay>
            {activeId ? (
              <TreeItem
                depth={activeItem.depth}
                clone
                childCount={
                  activeItem.children ? activeItem.children.length : 0
                }
                value={activeId}
                step={STEP}
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  );

  function handleDragStart({active: {id}}: DragStartEvent) {
    setActiveId(id);
    setOverId(id);

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({delta}: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({over}: DragOverEvent) {
    setOverId(over.id);
  }

  function handleDragEnd({active, over}: DragEndEvent) {
    const {depth, parentId} = projected;

    resetState();

    const clonedItems: FlattenedItem[] = JSON.parse(
      JSON.stringify(flattenTree(items))
    );
    const overIndex = clonedItems.findIndex(({id}) => id === over.id);
    const activeIndex = clonedItems.findIndex(({id}) => id === active.id);
    const activeTreeItem = clonedItems[activeIndex];

    clonedItems[activeIndex] = {...activeTreeItem, depth, parentId};

    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    const newItems = buildTree(sortedItems);

    console.log(sortedItems, newItems);

    setItems(newItems);
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty('cursor', '');
  }
}

export const BasicSetup = () => <SortableTree />;
