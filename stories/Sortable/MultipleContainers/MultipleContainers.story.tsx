import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  ActivationConstraint,
  closestRect,
  DraggableContext,
  DraggableClone,
  getElementCoordinates,
  Modifiers,
  useDroppable,
  UniqueIdentifier,
} from '@dropshift/core';
import {
  SortableContainer,
  useSortableElement,
  arrayMove,
  useSortableSensors,
  clientRectSortingStrategy,
  verticalListSortingStrategy,
  SortingStrategy,
} from '@dropshift/sortable';

import {
  Item,
  List,
  GridContainer,
  Button,
  FloatingControls,
  PlayingCard,
  getDeckOfCards,
  shuffle,
} from '../../components';

import {createRange} from '../../utilities';

export default {
  title: 'Presets|Sortable/Multiple Containers',
};

function DroppableContainer({
  children,
  id,
  items,
  getStyle = () => ({}),
  Component = List,
}: {
  children: React.ReactNode;
  id: string;
  items: string[];
  getStyle: ({
    isOverContainer,
  }: {
    isOverContainer: boolean;
  }) => React.CSSProperties;
  Component: React.FunctionComponent<any>;
}) {
  const hasItems = React.Children.count(children) > 0;
  const {over, isOver, setNodeRef} = useDroppable({
    id,
    disabled: hasItems,
  });
  const isOverContainer = isOver && over ? items.includes(over.id) : false;

  return (
    <Component ref={setNodeRef} style={getStyle({isOverContainer})}>
      {children}
    </Component>
  );
}

const defaultContainerStyle = ({
  isOverContainer,
}: {
  isOverContainer: boolean;
}) => ({
  backgroundColor: isOverContainer ? '#F4F4F4' : '#FAFAFA',
});

type Items = Record<string, string[]>;

interface Props {
  activationConstraint?: ActivationConstraint;
  adjustScale?: boolean;
  animateItemInsertion?: boolean;
  Container?: any;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isClone: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {index: number}): React.CSSProperties;
  getContainerStyle?(args: {isOverContainer: boolean}): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  translateModifiers?: Modifiers;
}

function Sortable({
  activationConstraint,
  adjustScale = false,
  animateItemInsertion = true,
  itemCount = 3,
  Container = DroppableContainer,
  handle = false,
  items: parentItems,
  getItemStyles = () => ({}),
  getContainerStyle = defaultContainerStyle,
  wrapperStyle = () => ({}),
  translateModifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
}: Props) {
  const [items, setItems] = useState<Items>(
    () =>
      parentItems ?? {
        A: createRange(itemCount, (index) => `A${index}`),
        B: createRange(itemCount, (index) => `B${index}`),
        C: createRange(itemCount, (index) => `C${index}`),
      }
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSortableSensors({
    strategy,
    mouse: {
      options: {
        activationConstraint,
      },
    },
  });
  const activeContainerRef: React.MutableRefObject<string | undefined> = useRef(
    undefined
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
    parentItems ? Object.values(parentItems) : []
  );

  return (
    <DraggableContext
      sensors={sensors}
      collisionDetection={closestRect}
      onDragStart={({active}) => {
        setActiveId(active.id);
        setClonedItems(items);

        activeContainerRef.current = findContainer(active.id);
      }}
      onDragOver={({over, draggingRect}) => {
        if (!over) {
          return;
        }

        const overContainer = findContainer(over.id);
        const activeContainer = activeContainerRef.current;

        if (!overContainer || !activeContainer || !activeId) {
          return;
        }

        if (activeContainer !== overContainer) {
          activeContainerRef.current = overContainer;

          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const activeIndex = activeItems.indexOf(activeId);
            const overIndex = overItems.indexOf(over.id);
            const isBelowLastItem =
              overIndex === overItems.length - 1 &&
              draggingRect.top >
                over.clientRect.bottom - over.clientRect.height / 2;

            const modifier = isBelowLastItem ? 1 : 0;
            const newIndex =
              overIndex >= 0 ? overIndex + modifier : overItems.length + 1;

            // TO-DO: Determine the new index based on whether the active rect is above / below the new item's rect?

            return {
              ...items,
              [activeContainer]: [
                ...items[activeContainer].filter((item) => item !== activeId),
              ],
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                // ...items[overContainer],
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
      onDragEnd={({over}) => {
        if (!over || !activeId) {
          return;
        }

        const overContainer = findContainer(over.id);
        const activeContainer = activeContainerRef.current;

        if (activeContainer && overContainer) {
          const activeIndex = items[activeContainer].indexOf(activeId);
          const overIndex = items[overContainer].indexOf(over.id);

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
        if (clonedItems) {
          // Reset items to their original state in case items have been
          // Dragged across containrs
          setItems(clonedItems);
        }

        setActiveId(null);
        setClonedItems(null);
      }}
      translateModifiers={translateModifiers}
    >
      {Object.keys(items).map((containerId) => (
        <SortableContainer
          id={containerId}
          items={items[containerId]}
          key={containerId}
        >
          <Container
            id={containerId}
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
                  strategy={strategy}
                  animate={animateItemInsertion}
                  style={getItemStyles}
                  wrapperStyle={wrapperStyle}
                  renderItem={renderItem}
                  containerId={containerId}
                  getIndex={getIndex}
                />
              );
            })}
          </Container>
        </SortableContainer>
      ))}
      {createPortal(
        <DraggableClone adjustScale={adjustScale}>
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
                isClone: true,
              })}
              wrapperStyle={wrapperStyle({index: 0})}
              renderItem={renderItem}
              clone
            />
          ) : null}
        </DraggableClone>,
        document.body
      )}
    </DraggableContext>
  );
}

interface SortableItemProps {
  animate?: boolean;
  containerId: string;
  id: string;
  index: number;
  handle: boolean;
  strategy: any;
  style(args: any): React.CSSProperties;
  getIndex(id: string): number;
  renderItem(): React.ReactElement;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
}

function SortableItem({
  animate,
  id,
  index,
  handle,
  strategy,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
  const {
    clientRect,
    node,
    inlineStyles,
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
  } = useSortableElement({
    id,
    strategy,
  });
  const mounted = useMountStatus();
  const prevIndex = useRef(index);
  const mountedWhileDragging = isDragging && !mounted;

  useEffect(() => {
    if (animate && node.current && isSorting && index !== prevIndex.current) {
      const top = clientRect.current?.offsetTop;
      const newTop = getElementCoordinates(node.current).offsetTop;

      if (top != null && top !== newTop) {
        node.current?.animate(
          [
            {
              transform: `translate3d(0, ${top - newTop}px, 0)`,
            },
            {transform: 'translate3d(0, 0, 0)'},
          ],
          {
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            iterations: 1,
            duration: 250,
          }
        );
      }
    }

    if (index !== prevIndex.current) {
      prevIndex.current = index;
    }
  }, [animate, index, isSorting]);

  return (
    <Item
      ref={setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      transform={transform}
      wrapperStyle={wrapperStyle({index})}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        inlineStyles,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
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

export const Grid = () => (
  <Sortable
    Container={(props: any) => <GridContainer columns={2} {...props} />}
    strategy={clientRectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
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
            position: relative;
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
        strategy={clientRectSortingStrategy}
        items={decks}
        animateItemInsertion={false}
        renderItem={({
          value,
          clone,
          dragging,
          sorting,
          index,
          listeners,
          ref,
          style,
          transform,
          fadeIn,
        }: any) => (
          <PlayingCard
            value={value.substring(2, value.length)}
            isPickedUp={clone}
            isDragging={dragging}
            isSorting={sorting}
            ref={ref}
            style={style}
            index={index}
            transform={transform}
            mountAnimation={!clone && !isMounted}
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
          isClone,
        }) => {
          const deck = decks[containerId as keyof typeof decks] || [];

          return {
            zIndex: isClone
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

    () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
