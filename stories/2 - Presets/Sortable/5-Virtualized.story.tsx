import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
// import VirtualList from 'react-tiny-virtual-list';
import VirtualList from '../../utilities/virtual/main';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import styles from './Virtualized.module.css';

import {createRange} from '../../utilities';
import {SortableItem, Props} from './Sortable';
import {Item, Wrapper} from '../../components';

export default {
  title: 'Presets/Sortable/Virtualized Multiple lists',
};

const ITEM_SIZE = 64;

function Sortable({
  adjustScale = false,
  strategy = verticalListSortingStrategy,
  itemCount = 300,
  handle = false,
  getItemStyles = () => ({}),
  modifiers,
}: Props) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [items, setItems] = useState(() =>
    createRange<string>(itemCount, (index) => `${index + 1}`)
  );

  const itemsSplitPoint = Math.floor(itemCount / 2);

  const itemsGroups = useMemo(() => {
    return [
      items.slice(0, itemsSplitPoint),
      items.slice(itemsSplitPoint),
    ] as const;
  }, [items]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const getIndex: (id: string) => number = items.indexOf.bind(items);
  const activeIndex = activeId ? getIndex(activeId) : -1;

  useEffect(() => {
    const abortController = new AbortController();

    window.addEventListener(
      'scroll',
      () => {
        setScrollPosition(window.scrollY);
      },
      {
        // @ts-ignore types aren't aligned yet with this spec addition
        signal: abortController.signal,
      }
    );

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({active}) => {
        setActiveId(active.id);
      }}
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
      modifiers={modifiers}
    >
      <Wrapper
        center
        style={{
          display: 'block',
        }}
      >
        <SortableContext items={items} strategy={strategy}>
          <VirtualList
            scrollOffset={scrollPosition}
            width={500}
            height={600}
            viewportHeight={window.document.documentElement.clientHeight}
            className={styles.VirtualList}
            itemCount={itemsGroups[0].length}
            itemSize={ITEM_SIZE}
            renderItem={({index, style}) => {
              const id = itemsGroups[0][index];

              return (
                <SortableItem
                  key={id}
                  id={id}
                  index={index}
                  handle={handle}
                  wrapperStyle={() => ({
                    ...style,
                    opacity: id === activeId ? 0 : undefined,
                    padding: 5,
                  })}
                  style={getItemStyles}
                />
              );
            }}
          />
          <div
            style={{
              height: 200,
              background: 'red',
            }}
          >
            SECOND LIST TITLE
          </div>
          <VirtualList
            scrollOffset={
              scrollPosition - 200 - itemsGroups[0].length * ITEM_SIZE
            }
            width={500}
            height={600}
            viewportHeight={window.document.documentElement.clientHeight}
            className={styles.VirtualList}
            itemCount={itemsGroups[1].length}
            itemSize={ITEM_SIZE}
            renderItem={({index, style}) => {
              const id = itemsGroups[1][index];

              return (
                <SortableItem
                  key={id}
                  id={id}
                  index={index}
                  handle={handle}
                  wrapperStyle={() => ({
                    ...style,
                    opacity: id === activeId ? 0 : undefined,
                    padding: 5,
                  })}
                  style={getItemStyles}
                />
              );
            }}
          />
        </SortableContext>
      </Wrapper>
      {createPortal(
        <DragOverlay adjustScale={adjustScale}>
          {activeId ? (
            <Item
              value={items[activeIndex]}
              handle={handle}
              style={getItemStyles({
                id: activeId,
                index: activeIndex,
                isDragging: true,
                isSorting: true,
                overIndex: -1,
                isDragOverlay: true,
              })}
              dragOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

const props = {
  strategy: verticalListSortingStrategy,
};

export const BasicSetup = () => <Sortable {...props} />;
