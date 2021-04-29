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
  Modifier,
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
  setProperty,
} from './utilities';
import type {FlattenedItem, SensorContext, TreeItems} from './types';
import {sortableTreeKeyboardCoordinates} from './keyboardCoordinates';
import {TreeItem, SortableTreeItem} from './components';
import VirtualList from 'react-tiny-virtual-list';

const SEED_DATA = [
  {id: 'Spring'},
  {id: 'Summer'},
  {id: 'Fall'},
  {id: 'Winter'},
];

type ItemData = {
  id: string;
  children: ItemData[];
};

let uuid = 1000;

function getUUID() {
  return uuid++;
}

function generateChildren(
  howManyDups: number,
  generation: number,
  howManyGenerations: number
): ItemData[] {
  return Array.from({length: howManyDups}, (_, index) => {
    return SEED_DATA.map((entry) => {
      return {
        id: `${getUUID()}.gen: ${generation} - r: ${index} - ${entry.id}`,
        children:
          howManyGenerations > 0
            ? generateChildren(howManyDups, ++generation, --howManyGenerations)
            : [],
      };
    });
  }).flat();
}

const initialItems: TreeItems = [
  {
    id: 'Home',
    children: [],
    subListTitle: true,
  },
  {
    id: 'Collections',
    children: generateChildren(3, 0, 0),
    subListTitle: true,
  },
  {
    id: 'Seasons',
    children: generateChildren(3, 0, 0),
    subListTitle: true,
  },
  {
    id: 'About Us',
    children: [],
    subListTitle: true,
  },
  {
    id: 'My Account',
    subListTitle: true,
    children: [
      {id: 'Addresses', children: []},
      {id: 'Order History', children: []},
    ],
  },
];

function notNull<T>(v: T): v is NonNullable<T> {
  return v !== null && v !== undefined;
}

const layoutMeasuring: Partial<LayoutMeasuring> = {
  strategy: LayoutMeasuringStrategy.Always,
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator,
  indentationWidth = 50,
  removable,
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, {children, collapsed, id}) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indentationWidth)
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
    <DndContext
      sensors={sensors}
      modifiers={indicator ? [adjustTranslate] : undefined}
      collisionDetection={closestCenter}
      layoutMeasuring={layoutMeasuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <VirtualList
          width="100%"
          height={400}
          className=""
          itemSize={64}
          itemCount={flattenedItems.length}
          overscanCount={3}
          stickyIndices={flattenedItems
            .map((item, index) => (item.subListTitle ? index : null))
            .filter(notNull)}
          renderItem={function ({index, style}) {
            const actualStyle = {
              ...style,
              position: 'absolute',
            } as const;
            const {id, children, collapsed, depth} = flattenedItems[index];

            return (
              <SortableTreeItem
                key={id}
                id={id}
                value={id}
                depth={id === activeId && projected ? projected.depth : depth}
                indentationWidth={indentationWidth}
                indicator={indicator}
                collapsed={Boolean(collapsed && children.length)}
                onCollapse={
                  collapsible && children.length
                    ? () => handleCollapse(id)
                    : undefined
                }
                onRemove={removable ? () => handleRemove(id) : undefined}
                wrapperAdditionalStyles={actualStyle}
              />
            );
          }}
        />
        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId && activeItem ? (
              <TreeItem
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={activeId}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
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

  function handleCollapse(id: string) {
    setItems((items) =>
      setProperty(items, id, 'collapsed', (value) => {
        return !value;
      })
    );
  }
}

const adjustTranslate: Modifier = ({transform}) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
