import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  closestCorners,
  CollisionDetection,
  rectIntersection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  Modifiers,
  PointerSensor,
  useDroppable,
  UniqueIdentifier,
  useSensors,
  useSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  SortingStrategy,
} from '@dnd-kit/sortable';

import {
  Item,
  List,
  Button,
  FloatingControls,
  PlayingCard,
  getDeckOfCards,
  shuffle,
} from '../components';

import {createRange} from '../utilities';

export default {
  title: 'Presets/Sortable/Multiple Containers',
};

function DroppableContainer({
  children,
  columns = 1,
  id,
  items,
  getStyle = () => ({}),
}: {
  children: React.ReactNode;
  columns?: number;
  id: string;
  items: string[];
  getStyle: ({
    isOverContainer,
  }: {
    isOverContainer: boolean;
  }) => React.CSSProperties;
}) {
  const {over, isOver, setNodeRef} = useDroppable({
    id,
  });
  const isOverContainer = isOver || (over ? items.includes(over.id) : false);

  return (
    <List
      ref={setNodeRef}
      style={getStyle({isOverContainer})}
      columns={columns}
    >
      {children}
    </List>
  );
}

const defaultContainerStyle = ({
  isOverContainer,
}: {
  isOverContainer: boolean;
}) => ({
  marginTop: 40,
  backgroundColor: isOverContainer
    ? 'rgb(235,235,235,1)'
    : 'rgba(246,246,246,1)',
});

type Items = Record<string, string[]>;

interface Props {
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  columns?: number;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {index: number}): React.CSSProperties;
  getContainerStyle?(args: {isOverContainer: boolean}): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  trashable?: boolean;
  vertical?: boolean;
}

const VOID_ID = 'void';

function Sortable({
  adjustScale = false,
  itemCount = 3,
  collisionDetection = closestCorners,
  columns,
  handle = false,
  items: parentItems,
  getItemStyles = () => ({}),
  getContainerStyle = defaultContainerStyle,
  wrapperStyle = () => ({}),
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
}: Props) {
  const [items, setItems] = useState<Items>(
    () =>
      parentItems ?? {
        A: createRange(itemCount, (index) => `A${index}`),
        B: createRange(itemCount, (index) => `B${index}`),
        C: createRange(itemCount, (index) => `C${index}`),
        D: createRange(itemCount, (index) => `D${index}`),
        [VOID_ID]: [],
      }
  );
  const [dragOverlaydItems, setClonedItems] = useState<Items | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: string) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  useEffect(
    () => {
      if (parentItems) {
        setItems(parentItems);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    parentItems ? Object.values(parentItems) : []
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={({active, over, draggingRect}) => {
        const overId = over?.id || VOID_ID;
        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = overItems.indexOf(overId);
            const activeIndex = activeItems.indexOf(active.id);

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowLastItem =
                over &&
                overIndex === overItems.length - 1 &&
                draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

              const modifier = isBelowLastItem ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
              ...items,
              [activeContainer]: [
                ...items[activeContainer].filter((item) => item !== active.id),
              ],
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(
                  newIndex,
                  items[overContainer].length
                ),
              ],
            };
          });
        }
      }}
      onDragEnd={({active, over}) => {
        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id || VOID_ID;

        if (overId === VOID_ID) {
          setItems((items) => ({
            ...(trashable && over?.id === VOID_ID ? items : dragOverlaydItems),
            [VOID_ID]: [],
          }));
          setActiveId(null);
          return;
        }

        const overContainer = findContainer(overId);

        if (activeContainer && overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            setItems((items) => ({
              ...items,
              [overContainer]: arrayMove(
                items[overContainer],
                activeIndex,
                overIndex
              ),
            }));
          }
        }

        setActiveId(null);
      }}
      onDragCancel={() => {
        if (dragOverlaydItems) {
          // Reset items to their original state in case items have been
          // Dragged across containrs
          setItems(dragOverlaydItems);
        }

        setActiveId(null);
        setClonedItems(null);
      }}
      modifiers={modifiers}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: '0px 20px',
          gridAutoFlow: vertical ? 'row' : 'column',
        }}
      >
        {Object.keys(items)
          .filter((key) => key !== VOID_ID)
          .map((containerId) => (
            <SortableContext
              key={containerId}
              items={items[containerId]}
              strategy={strategy}
            >
              <DroppableContainer
                id={containerId}
                columns={columns}
                items={items[containerId]}
                getStyle={getContainerStyle}
              >
                {items[containerId].map((value, index) => {
                  return (
                    <SortableItem
                      key={value}
                      id={value}
                      index={index}
                      handle={handle}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      renderItem={renderItem}
                      containerId={containerId}
                      getIndex={getIndex}
                    />
                  );
                })}
              </DroppableContainer>
            </SortableContext>
          ))}
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale}>
          {activeId ? (
            <Item
              value={activeId}
              handle={handle}
              style={getItemStyles({
                containerId: findContainer(activeId) as string,
                overIndex: -1,
                index: getIndex(activeId),
                value: activeId,
                isSorting: activeId !== null,
                isDragging: true,
                isDragOverlay: true,
              })}
              wrapperStyle={wrapperStyle({index: 0})}
              renderItem={renderItem}
              dragOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
      {trashable && activeId ? <Trash /> : null}
    </DndContext>
  );
}

function Trash() {
  const {setNodeRef, isOver} = useDroppable({
    id: VOID_ID,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        left: '50%',
        marginLeft: -150,
        bottom: 20,
        width: 300,
        height: 60,
        borderRadius: 5,
        border: '1px solid',
        borderColor: isOver ? 'red' : '#DDD',
      }}
    >
      Drop here to delete
    </div>
  );
}

interface SortableItemProps {
  containerId: string;
  id: string;
  index: number;
  handle: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: string): number;
  renderItem(): React.ReactElement;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
}

function SortableItem({
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      wrapperStyle={wrapperStyle({index})}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}

export const BasicSetup = () => <Sortable />;

export const ManyItems = () => (
  <Sortable
    itemCount={15}
    getContainerStyle={(args) => ({
      ...defaultContainerStyle(args),
      maxHeight: '80vh',
      overflowY: 'auto',
    })}
  />
);

export const Vertical = () => <Sortable itemCount={5} vertical />;

const customCollisionDetectionStrategy: CollisionDetection = (rects, rect) => {
  const voidRects = rects.filter(([id]) => id === VOID_ID);
  const intersectingVoidRect = rectIntersection(voidRects, rect);

  if (intersectingVoidRect) {
    return intersectingVoidRect;
  }

  const otherRects = rects.filter(([id]) => id !== VOID_ID);
  return closestCorners(otherRects, rect);
};

export const TrashableItems = () => (
  <Sortable collisionDetection={customCollisionDetectionStrategy} trashable />
);

export const Grid = () => (
  <Sortable
    columns={2}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
  />
);

export const VerticalGrid = () => (
  <Sortable
    columns={2}
    itemCount={5}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
    vertical
  />
);

function stringifyDeck(
  deck: {
    value: string;
    suit: string;
  }[],
  prefix: string
) {
  return deck.map(({suit, value}) => `${prefix}-${value}${suit}`);
}

export const TransformedItems = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [decks, setDecks] = useState(() => {
    const deck = getDeckOfCards();
    const deckA = deck.slice(0, 13);
    const deckB = deck.slice(13, 26);
    const deckC = deck.slice(26, 39);
    const deckD = deck.slice(39, 52);

    return {
      A: stringifyDeck(deckA, 'A'),
      B: stringifyDeck(deckB, 'B'),
      C: stringifyDeck(deckC, 'C'),
      D: stringifyDeck(deckD, 'D'),
    };
  });

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 2500);
  }, []);

  return (
    <>
      <style>
        {`
          main {
            top: 100px;
            left: 140px;
          }

          ul {
            position: relative;
            margin-left: 50px;
            margin-right: 50px;
          }
        `}
      </style>
      <FloatingControls>
        <Button
          onClick={() =>
            setDecks(({A, B, C, D}) => ({
              A: shuffle(A.slice()),
              B: shuffle(B.slice()),
              C: shuffle(C.slice()),
              D: shuffle(D.slice()),
            }))
          }
        >
          Shuffle cards
        </Button>
      </FloatingControls>
      <Sortable
        strategy={rectSortingStrategy}
        items={decks}
        renderItem={({
          value,
          dragOverlay,
          dragging,
          sorting,
          index,
          listeners,
          ref,
          style,
          transform,
          transition,
          fadeIn,
        }: any) => (
          <PlayingCard
            value={value.substring(2, value.length)}
            isDragging={dragging}
            isPickedUp={dragOverlay}
            isSorting={sorting}
            ref={ref}
            style={style}
            index={index}
            transform={transform}
            transition={transition}
            mountAnimation={!dragOverlay && !isMounted}
            fadeIn={fadeIn}
            {...listeners}
          />
        )}
        getContainerStyle={() => ({
          position: 'relative',
          flexShrink: 0,
          width: 330,
          margin: '20px 20px',
        })}
        getItemStyles={({
          index,
          overIndex,
          isDragging,
          containerId,
          isDragOverlay,
        }) => {
          const deck = decks[containerId as keyof typeof decks] || [];

          return {
            zIndex: isDragOverlay
              ? undefined
              : isDragging
              ? deck.length - overIndex
              : deck.length - index,
          };
        }}
      />
    </>
  );
};

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
