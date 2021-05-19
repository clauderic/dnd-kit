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
import {afterNextPaint} from '../../utilities/useTransitionalChange';

const SEED_DATA = [
  {id: 'Spring'},
  {id: 'Summer'},
  {id: 'Fall'},
  {id: 'Winter'},
];

const MAGIC_ADD_NUMBER = 1;

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
      {id: 'Addresses', children: [], subListTitle: true},
      {id: 'Order History', children: [], subListTitle: true},
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

const OVERSCAN = 0;

export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator,
  indentationWidth = 50,
  removable,
}: Props) {
  const itemSize = 64;
  const listViewportHeight = 400;
  const maxItemsFitInViewport = Math.ceil(listViewportHeight / itemSize);

  const [goForIt] = React.useState(true);
  const [items, setItems] = useState(() => defaultItems);
  const [mostRecentExpandOrCollapse, setMostRecentExpandOrCollapse] = useState<
    string | null
  >(null);
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
      goForIt ? (activeId ? [activeId, ...collapsedItems] : collapsedItems) : []
    );
  }, [activeId, goForIt, items]);
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

  let itemsToBeCollapsedOrExpandStartIndex = mostRecentExpandOrCollapse
    ? flattenedItems.findIndex(
        (item) => item.parentId === mostRecentExpandOrCollapse
      )
    : null;
  let itemsToBeCollapsedOrExpandEndIndex = mostRecentExpandOrCollapse
    ? flattenedItems
        .map((i) => i.parentId)
        .lastIndexOf(mostRecentExpandOrCollapse)
    : null;

  if (
    itemsToBeCollapsedOrExpandStartIndex === -1 ||
    itemsToBeCollapsedOrExpandEndIndex === -1
  ) {
    itemsToBeCollapsedOrExpandStartIndex = null;
    itemsToBeCollapsedOrExpandEndIndex = null;
  }

  const totalItemsToBeCollapsedOrExpand =
    (itemsToBeCollapsedOrExpandEndIndex ?? 0) -
    (itemsToBeCollapsedOrExpandStartIndex ?? 0);

  const overscanValue =
    React.useMemo(() => {
      if (mostRecentExpandOrCollapse) {
        return maxItemsFitInViewport + OVERSCAN;
      }

      return OVERSCAN;
    }, [maxItemsFitInViewport, mostRecentExpandOrCollapse]) + MAGIC_ADD_NUMBER;

  function onTransitionEnd(event: React.TransitionEvent<HTMLElement>) {
    setMostRecentExpandOrCollapse(null);
  }

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
        <div onTransitionEnd={onTransitionEnd}>
          <VirtualList
            width="100%"
            height={listViewportHeight}
            className=""
            itemSize={itemSize}
            itemCount={flattenedItems.length}
            overscanCount={overscanValue}
            renderItem={function ({index, style}) {
              let resolvedIndex = index;
              if (
                itemsToBeCollapsedOrExpandStartIndex !== null &&
                itemsToBeCollapsedOrExpandEndIndex !== null &&
                index >
                  itemsToBeCollapsedOrExpandStartIndex + maxItemsFitInViewport
              ) {
                resolvedIndex +=
                  totalItemsToBeCollapsedOrExpand - maxItemsFitInViewport;
              }

              // there are no additional items we can render
              if (resolvedIndex >= flattenedItems.length) {
                return null;
              }

              const {id, children, collapsed, parentId, depth} = flattenedItems[
                resolvedIndex
              ];

              return (
                <SortableTreeItem
                  key={`${parentId}${id}`}
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
                  wrapperAdditionalStyles={style}
                />
              );
            }}
          />
        </div>
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
    setMostRecentExpandOrCollapse(id);
    afterNextPaint(() => {
      setItems((items) =>
        setProperty(items, id, 'collapsed', (value) => {
          return !value;
        })
      );
    });
  }
}

const adjustTranslate: Modifier = ({transform}) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
