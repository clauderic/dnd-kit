import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
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
  LayoutMeasuring,
  LayoutMeasuringStrategy,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
} from './utilities';
import type {FlattenedItem, SensorContext, TreeItems} from './types';
import {sortableTreeKeyboardCoordinates} from './keyboardCoordinates';
import {TreeItem, SortableTreeItem} from './components';

const initialItems: TreeItems = [
  {
    id: 'Home',
    children: [],
  },
  {
    id: 'Collections',
    children: [
      {id: 'Spring', children: []},
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

const layoutMeasuring: Partial<LayoutMeasuring> = {
  strategy: LayoutMeasuringStrategy.BeforeDragging,
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

export function SortableTree() {
  const [items, setItems] = useState(() => initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const flattenedItems = useMemo(
    () =>
      activeId
        ? removeChildrenOf(flattenTree(items), activeId)
        : flattenTree(items),
    [activeId, items]
  );
  const projected =
    activeId && overId
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
        margin: '0 auto',
        marginTop: 100,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        layoutMeasuring={layoutMeasuring}
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
          {flattenedItems.map(({id, depth}) => (
            <SortableTreeItem
              key={id}
              id={id}
              value={id}
              depth={id === activeId && projected ? projected.depth : depth}
              step={STEP}
              onRemove={() => handleRemove(id)}
            />
          ))}
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? (
                <TreeItem
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items, activeId) + 1}
                  value={activeId}
                  step={STEP}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
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
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({active, over}: DragEndEvent) {
    resetState();

    if (projected && over) {
      const {depth, parentId} = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({id}) => id === over.id);
      const activeIndex = clonedItems.findIndex(({id}) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = {...activeTreeItem, depth, parentId};

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
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

  function handleRemove(id: string) {
    setItems((items) => removeItem(items, id));
  }
}
