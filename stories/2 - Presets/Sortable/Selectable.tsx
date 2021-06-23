import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import classNames from 'classnames';
import {
  closestCorners,
  CollisionDetection,
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
  verticalListSortingStrategy,
  SortingStrategy,
} from '@dnd-kit/sortable';

import {Item, List} from '../../components';

import {createRange} from '../../utilities';

import styles from './Selectable.module.css';

const DROPPED_ITEM_TIMEOUT = 2000;

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

export const defaultContainerStyle = ({
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

export const VOID_ID = 'void';

export function Selectable({
  adjustScale = false,
  itemCount = 3,
  collisionDetection = closestCorners,
  columns,
  handle = false,
  items: initialItems,
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
      initialItems ?? {
        A: createRange(itemCount, (index) => `A${index + 1}`),
        B: createRange(itemCount, (index) => `B${index + 1}`),
        C: createRange(itemCount, (index) => `C${index + 1}`),
        D: createRange(itemCount, (index) => `D${index + 1}`),
        [VOID_ID]: [],
      }
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  const [dragOverlaydItems, setClonedItems] = useState<Items | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
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

  const isItemSelected = (itemId: string): boolean =>
    selectedItems.includes(itemId);

  const onSelectionChanged = (id: string, isShiftSelect: boolean) => {
    if (isShiftSelect) {
      if (isItemSelected(id)) {
        setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
      } else {
        setSelectedItems([...selectedItems, id]);
      }
    } else {
      setSelectedItems([]);
    }
  };

  useEffect(() => {
    const clearSelection = ({target}: any) => {
      if (target.nodeName !== 'LI' && target.parentNode.nodeName !== 'LI') {
        setSelectedItems([]);
      }
    };
    document.addEventListener('click', clearSelection);

    return () => {
      document.removeEventListener('click', clearSelection);
    };
  }, []);

  useEffect(() => {
    let timeout = 0;
    if (droppedItems.length) {
      timeout = window.setTimeout(
        () => setDroppedItems([]),
        DROPPED_ITEM_TIMEOUT
      );
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [droppedItems.length]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        setActiveId(active.id);
        setClonedItems(items);

        if (!isItemSelected(active.id)) {
          setSelectedItems([]);
        } else if (selectedItems.length > 0) {
          setItems((items) =>
            selectedItems.reduce((ret, selectedItem) => {
              if (selectedItem === active.id) {
                return ret;
              }
              const container = findContainer(selectedItem);
              return !container
                ? ret
                : {
                    ...ret,
                    [container]: ret[container].filter(
                      (item) => item !== selectedItem
                    ),
                  };
            }, items)
          );
        }
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

        const overId = over?.id || '';

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

          if (selectedItems.length) {
            setItems((items) => {
              const newItems = {...items};
              newItems[overContainer] = arrayMove(
                newItems[overContainer],
                activeIndex,
                overIndex
              );
              newItems[overContainer].splice(
                overIndex + 1,
                0,
                ...selectedItems.filter((item) => item !== activeId)
              );
              return newItems;
            });
            setDroppedItems(selectedItems);
            setSelectedItems([]);
          } else if (activeIndex !== overIndex) {
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
                    <SelectableSortableItem
                      key={value}
                      id={value}
                      isSelected={isItemSelected(value)}
                      onSelect={onSelectionChanged}
                      isDropped={droppedItems.includes(value)}
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
        <DragOverlay
          adjustScale={adjustScale}
          className={styles.DragOverlayContainer}
          style={{}}
        >
          {activeId ? (
            <>
              <Item
                value={activeId}
                handle={handle}
                className={selectedItems.length > 0 ? styles.SelectedItem : ''}
                style={getItemStyles({
                  containerId: findContainer(activeId) as string,
                  overIndex: -1,
                  index: getIndex(activeId),
                  value: activeId,
                  isSorting: activeId !== null,
                  isDragging: true,
                  isDragOverlay: true,
                })}
                color={getColor(activeId)}
                wrapperStyle={wrapperStyle({index: 0})}
                renderItem={renderItem}
                dragOverlay
              />
              {selectedItems
                .filter((itemId) => itemId !== activeId)
                .slice(0, 4)
                .map((itemId) => (
                  <Item
                    key={itemId}
                    value={itemId}
                    className={styles.SelectedItem}
                    handle={handle}
                    style={getItemStyles({
                      containerId: findContainer(itemId) as string,
                      overIndex: -1,
                      index: getIndex(itemId),
                      value: itemId,
                      isSorting: itemId !== null,
                      isDragging: true,
                      isDragOverlay: true,
                    })}
                    color={getColor(itemId)}
                    wrapperStyle={wrapperStyle({index: 0})}
                    renderItem={renderItem}
                    dragOverlay
                  />
                ))}
              {selectedItems.length > 5 && (
                <div className={styles.Badge}>
                  <span>{selectedItems.length} items</span>
                </div>
              )}
            </>
          ) : null}
        </DragOverlay>,
        document.body
      )}
      {trashable && activeId ? <Trash /> : null}
    </DndContext>
  );
}

function getColor(id: string) {
  switch (id[0]) {
    case 'A':
      return '#7193f1';
    case 'B':
      return '#ffda6c';
    case 'C':
      return '#00bcd4';
    case 'D':
      return '#ef769f';
  }

  return undefined;
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

interface SelectableSortableItemProps {
  isSelected: boolean;
  onSelect: (id: string, isShiftSelect: boolean) => void;
  isDropped?: boolean;
  containerId: string;
  id: string;
  index: number;
  handle: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: string): number;
  renderItem(): React.ReactElement;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
}

function SelectableSortableItem({
  isSelected,
  onSelect,
  isDropped,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SelectableSortableItemProps) {
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

  const newlisteners = {
    ...listeners,
    onClick: (event: any) => {
      onSelect(id, event.shiftKey);
    },
  };

  const className = classNames(
    isSelected && styles.SelectedItem,
    isDropped && styles.DroppedItem
  );

  return (
    <Item
      ref={setNodeRef}
      className={className}
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
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={newlisteners}
      renderItem={renderItem}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
