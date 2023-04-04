import React, {useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {
  Active,
  Announcements,
  closestCenter,
  CollisionDetection,
  DragOverlay,
  DndContext,
  DropAnimation,
  KeyboardSensor,
  KeyboardCoordinateGetter,
  Modifiers,
  MouseSensor,
  MeasuringConfiguration,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  useDndContext,
  useConditionalDndContext,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  rectSortingStrategy,
  AnimateLayoutChanges,
  NewIndexGetter,
} from '@dnd-kit/sortable';

import {createRange} from '../../utilities';
import {Item, List, Wrapper} from '../../components';

export interface Props {
  activationConstraint?: PointerActivationConstraint;
  animateLayoutChanges?: AnimateLayoutChanges;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  Container?: any; // To-do: Fix me
  dropAnimation?: DropAnimation | null;
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  itemCount?: number;
  items?: UniqueIdentifier[];
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  renderItem?: any;
  removable?: boolean;
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  style?: React.CSSProperties;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    active: Pick<Active, 'id'> | null;
    index: number;
    isDragging: boolean;
    id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
  usingGlobalActiveInStyle?: boolean;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export function Sortable({
  activationConstraint,
  animateLayoutChanges,
  adjustScale = false,
  Container = List,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  dropAnimation = dropAnimationConfig,
  getItemStyles = () => ({}),
  getNewIndex,
  handle = false,
  itemCount = 16,
  items: initialItems,
  isDisabled = () => false,
  measuring,
  modifiers,
  removable,
  renderItem,
  reorderItems = arrayMove,
  strategy = rectSortingStrategy,
  style,
  useDragOverlay = true,
  wrapperStyle = () => ({}),
  usingGlobalActiveInStyle = false,
}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(
    () =>
      initialItems ??
      createRange<UniqueIdentifier>(itemCount, (index) => index + 1)
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      // Disable smooth scrolling in Cypress automated tests
      scrollBehavior: 'Cypress' in window ? 'auto' : undefined,
      coordinateGetter,
    })
  );
  const isFirstAnnouncement = useRef(true);
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id);
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const handleRemove = removable
    ? (id: UniqueIdentifier) =>
        setItems((items) => items.filter((item) => item !== id))
    : undefined;
  const announcements: Announcements = {
    onDragStart({active: {id}}) {
      return `Picked up sortable item ${String(
        id
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        items.length
      }`;
    },
    onDragOver({active, over}) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragEnd({active, over}) {
      isFirstAnnouncement.current = true;
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragCancel({active: {id}}) {
      isFirstAnnouncement.current = true;
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id
      )} of ${items.length}.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions,
      }}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragEnd={({over, active}) => {
        if (over) {
          const overIndex = getIndex(over.id);
          const activeIndex = getIndex(active.id);
          if (activeIndex !== overIndex) {
            setItems((items) => reorderItems(items, activeIndex, overIndex));
          }
        }
      }}
      measuring={measuring}
      modifiers={modifiers}
    >
      <Wrapper style={style} center>
        <SortableContext
          items={items}
          strategy={strategy}
          getNewIndex={getNewIndex}
        >
          <Container>
            {items.map((value, index) => (
              <SortableItem
                key={value}
                id={value}
                handle={handle}
                index={index}
                style={getItemStyles}
                wrapperStyle={wrapperStyle}
                disabled={isDisabled(value)}
                renderItem={renderItem}
                onRemove={handleRemove}
                animateLayoutChanges={animateLayoutChanges}
                useDragOverlay={useDragOverlay}
                usingGlobalActiveInStyle={usingGlobalActiveInStyle}
              />
            ))}
          </Container>
        </SortableContext>
      </Wrapper>
      {useDragOverlay ? (
        <SortableDragOverlay
          items={items}
          adjustScale={adjustScale}
          dropAnimation={dropAnimation}
          handle={handle}
          renderItem={renderItem}
          wrapperStyle={wrapperStyle}
          getItemStyles={getItemStyles}
        />
      ) : null}
    </DndContext>
  );
}

function SortableDragOverlay({
  items,
  adjustScale,
  dropAnimation,
  handle,
  renderItem,
  wrapperStyle,
  getItemStyles,
}: Pick<Props, 'adjustScale' | 'dropAnimation' | 'handle' | 'renderItem'> & {
  items: UniqueIdentifier[];
  wrapperStyle: Exclude<Props['wrapperStyle'], undefined>;
  getItemStyles: Exclude<Props['getItemStyles'], undefined>;
}) {
  const {active} = useDndContext();
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id);
  const activeIndex = active ? getIndex(active.id) : -1;

  return createPortal(
    <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
      {active ? (
        <Item
          value={items[activeIndex]}
          handle={handle}
          renderItem={renderItem}
          wrapperStyle={wrapperStyle({
            active: {id: active.id},
            index: activeIndex,
            isDragging: true,
            id: items[activeIndex],
          })}
          style={getItemStyles({
            id: items[activeIndex],
            index: activeIndex,
            isSorting: active !== null,
            isDragging: true,
            overIndex: -1,
            isDragOverlay: true,
          })}
          dragOverlay
        />
      ) : null}
    </DragOverlay>,
    document.body
  );
}

interface SortableItemProps {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  useDragOverlay?: boolean;
  onRemove?(id: UniqueIdentifier): void;
  style(values: any): React.CSSProperties;
  renderItem?(args: any): React.ReactElement;
  wrapperStyle: Props['wrapperStyle'];
  usingGlobalActiveInStyle: boolean;
}

export function SortableItem({
  disabled,
  animateLayoutChanges,
  handle,
  id,
  index,
  onRemove,
  style,
  renderItem,
  useDragOverlay,
  wrapperStyle,
  usingGlobalActiveInStyle,
}: SortableItemProps) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled,
  });

  const dndContext = useConditionalDndContext(usingGlobalActiveInStyle);

  return (
    <Item
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={true}
      handle={handle}
      handleProps={
        handle
          ? {
              ref: setActivatorNodeRef,
            }
          : undefined
      }
      renderItem={renderItem}
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting: usingGlobalActiveInStyle ? !!dndContext?.active : true,
        overIndex: 3,
      })}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      wrapperStyle={wrapperStyle?.({
        index,
        isDragging,
        active: dndContext?.active || active,
        id,
      })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
    />
  );
}
