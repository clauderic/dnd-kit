import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import VirtualList from 'react-tiny-virtual-list';

import {
  arrayMove,
  useSortableSensors,
  SortableContainer,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {closestRect, DndContext, DraggableClone} from '@dnd-kit/core';

import styles from './Virtualized.module.css';

import {createRange} from '../../utilities';
import {SortableItem, Props} from '../Sortable';
import {Item} from '../../components';

function Sortable({
  activationConstraint,
  adjustScale = false,
  strategy = verticalListSortingStrategy,
  itemCount = 100,
  handle = false,
  getItemStyles = () => ({}),
  translateModifiers,
}: Props) {
  const [items, setItems] = useState(() =>
    createRange<string>(itemCount, (index) => index.toString())
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSortableSensors({
    strategy,
    mouse: {
      options: {
        activationConstraint,
      },
    },
  });
  const getIndex: (id: string) => number = items.indexOf.bind(items);
  const activeIndex = activeId ? getIndex(activeId) : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestRect}
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
      translateModifiers={translateModifiers}
    >
      <SortableContainer id="virtualized" items={items}>
        <VirtualList
          width={500}
          height={600}
          className={styles.VirtualList}
          itemCount={items.length}
          itemSize={64}
          renderItem={({index, style}) => {
            const id = items[index];

            return (
              <SortableItem
                key={id}
                id={id}
                index={index}
                handle={handle}
                strategy={strategy}
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
      </SortableContainer>
      {createPortal(
        <DraggableClone adjustScale={adjustScale}>
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
                isClone: true,
              })}
              clone
            />
          ) : null}
        </DraggableClone>,
        document.body
      )}
    </DndContext>
  );
}

export default {
  title: 'Presets|Sortable/Virtualized',
};

const props = {
  strategy: verticalListSortingStrategy,
};

export const BasicSetup = () => <Sortable {...props} />;
