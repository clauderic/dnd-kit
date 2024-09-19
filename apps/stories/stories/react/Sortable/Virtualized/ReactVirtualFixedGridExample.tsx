import React, { useRef, useEffect, useState, useMemo, forwardRef, PropsWithChildren } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/abstract';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { defaultPreset } from '@dnd-kit/dom';
import { Debug } from '@dnd-kit/dom/plugins/debug';
import { move } from '@dnd-kit/helpers';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Item, Handle } from '../../components';
import { createRange, cloneDeep } from '../../../utilities';

interface Props {
  debug?: boolean;
}


const gapCol = 20;
const gapRow = 20;
const itemWidth = 300;
const itemHeight = 62;
const paddingHorizontal = 48;
const paddingVertical = 23;


export function ReactVirtualFixedGridExample({ debug }: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(createRange(1000).map(x => ({ id: 'n' + x })));
  const snapshot = useRef(cloneDeep(items));

  const draggingIndex = useRef<number | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(2);

  const rowCount = useMemo(
    () => Math.ceil(items.length / columnCount),
    [items.length, columnCount]
  );

  const updateColumnCount = () => {
    const padHorizontal = paddingHorizontal * 2;
    const availableWidth = window.innerWidth - padHorizontal;
    const newColumnCount = Math.floor(
      availableWidth / (itemWidth + gapCol)
    );

    setColumnCount(newColumnCount);
  };

  useEffect(() => {
    updateColumnCount();

    window.addEventListener('resize', updateColumnCount)

    return () => window.removeEventListener('resize', updateColumnCount)
  }, []);


  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getItemKey: (index) => {
      return items[index].id
    },
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight,
    overscan: 1,
    gap: gapRow,
    paddingStart: paddingVertical,
    paddingEnd: paddingVertical,
    rangeExtractor(range) {

      const start = Math.max(range.startIndex - range.overscan, 0)
      const end = Math.min(range.endIndex + range.overscan, range.count - 1)

      const arr = []

      for (let i = start; i <= end; i++) {
        arr.push(i)
      }

      if (draggingIndex.current !== null) {
        const includes = arr.includes(draggingIndex.current)
        if (range.endIndex > draggingIndex.current)
          if (!includes) arr.push(0)
      }

      return arr;
    },
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columnCount,
    getItemKey: (index) => {
      return items[index].id
    },
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemWidth,
    overscan: 1,
    gap: gapCol,
    paddingStart: paddingHorizontal,
    paddingEnd: paddingHorizontal,
    rangeExtractor(range) {

      const start = Math.max(range.startIndex - range.overscan, 0)
      const end = Math.min(range.endIndex + range.overscan, range.count - 1)

      const arr = []

      for (let i = start; i <= end; i++) {
        arr.push(i)
      }

      if (draggingIndex.current !== null) {
        const includes = arr.includes(draggingIndex.current)
        if (range.endIndex > draggingIndex.current)
          if (!includes) arr.push(0)
      }

      return arr
    },
  });

  return (

    <DragDropProvider

      plugins={debug ? [Debug, ...defaultPreset.plugins] : undefined}
      onDragStart={(e) => {

        draggingIndex.current = e.operation.source.sortable.index
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const { source, target } = event.operation;

        if (!source || !target) {
          return;
        }

        setItems((items) => move(items, source, target));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(snapshot.current);
        }
        draggingIndex.current = null
      }}
    >
      <div ref={scrollRef} style={{
        height: '500px',
        width: '100%',
        position: 'relative',
        overflow: 'auto',
      }}>

        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            padding: `${paddingVertical}px ${paddingHorizontal}px `,
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridGap: `${gapRow}px ${gapCol}px`,
            gridTemplateColumns: `repeat(${columnCount}, ${itemWidth}px)`,
            gridAutoRows: 'auto',
            justifyContent: 'flex-start',
            alignContent: 'flex-start',
            transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start - rowVirtualizer.options.scrollMargin
              }px)`,
          }}
        >
          {rowVirtualizer.getVirtualItems()
            .map((virtualRow) => (
              <React.Fragment key={virtualRow.key}>
                {columnVirtualizer
                  .getVirtualItems()
                  .map((virtualColumn) => {
                    const index =
                      virtualRow.index * columnCount +
                      virtualColumn.index;

                    return (
                      <Sortable
                        id={items[index].id}
                        index={index}
                        key={items[index].id}
                      />
                    );
                  })}
              </React.Fragment>
            ))}
        </div>

      </div>
    </DragDropProvider>
  );
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
}

const Sortable: React.FC<SortableProps> = ({ id, index, }) => {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const { isDragSource } = useSortable({
    id,
    index,
    element,
    feedback: 'clone',
    handle: handleRef,
  });

  return (
    <Item
      ref={(el) => {
        setElement(el);
      }}
      actions={<Handle ref={handleRef} />}
      data-index={index}
      shadow={isDragSource}
    >
      {id}
    </Item>
  );
}

