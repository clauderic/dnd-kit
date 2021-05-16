import React, {useState} from 'react';
import {createPortal} from 'react-dom';
// import VirtualList from 'react-tiny-virtual-list';
import {ContainedVirtualizedList} from '../../utilities/ContainedVirtualizedList/ContainedVirtualizedList';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  useDroppable,
  LayoutMeasuringStrategy,
  Active,
  Over,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  SortingStrategy,
} from '@dnd-kit/sortable';

import styles from './Virtualized.module.css';

import {SortableItem, Props} from './Sortable';
import {Item, Wrapper} from '../../components';
import {CSS} from '@dnd-kit/utilities';
import {CustomCollisionDetection} from './CustomCollisionDetection';
import {useTransitionalChange} from '../../utilities/useTransitionalChange';
import {
  generateGroups,
  generateGroupsCollapseState,
  getGroupAndIndexForId,
  groupTitleId,
  groupWrapperId,
  moveItem,
  useElementHeightAndScrollPosition,
} from '../../utilities/helperz';

export default {
  title: 'Presets/Sortable/Virtualized Multiple lists - modded lib',
};

const layoutMeasuring = {
  strategy: LayoutMeasuringStrategy.Always,
};

const ITEM_SIZE = 64;
const GROUP_HEADER_HEIGHT = 50;

const HOW_MANY_GROUPS = 7;
const HOW_MANY_ITEMS_PER_GROUP = 12;

function Sortable({
  adjustScale = false,
  strategy = verticalListSortingStrategy,
  // itemCount = HOW_MANY_ITEMS_PER_GROUP,
  handle = false,
  getItemStyles = () => ({}),
  modifiers,
}: Props) {
  const [wrapperDiv, setWrapperDiv] = React.useState<HTMLDivElement | null>(
    null
  );

  const [groupsItems, setGroupsItems] = useState(() =>
    generateGroups(HOW_MANY_GROUPS, HOW_MANY_ITEMS_PER_GROUP)
  );

  const [groupsCollapseState, setGroupsCollapseState] = useState(() => {
    return generateGroupsCollapseState(HOW_MANY_GROUPS);
  });

  const collisionDetection = React.useMemo(
    function () {
      const groupsWrappersIds = Object.entries(groupsItems).map(([id]) =>
        groupWrapperId(id)
      );

      const groupsWrappersItemIdsMap = Object.fromEntries(
        Object.entries(groupsItems).map(([groupId]) => {
          return [
            groupWrapperId(groupId),
            groupsCollapseState[groupId]
              ? [groupTitleId(groupId)]
              : groupsItems[groupId],
          ];
        })
      );

      return CustomCollisionDetection(
        groupsWrappersIds,
        groupsWrappersItemIdsMap
      );
    },
    [groupsCollapseState, groupsItems]
  );

  const {elementHeight, elementScrollTop} = useElementHeightAndScrollPosition(
    wrapperDiv
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeGroupAndIndex = activeId
    ? getGroupAndIndexForId(groupsItems, activeId)
    : null;

  const listCollapseHandler = React.useCallback(
    (collapsed: boolean, groupId: string) => {
      setGroupsCollapseState((prev) => {
        return {...prev, [groupId]: collapsed};
      });
    },
    []
  );

  const allItemsIds = React.useMemo(
    () =>
      Object.entries(groupsItems)
        .map(([id, groupItems]) => {
          return [
            // groupWrapperId(id),
            groupTitleId(id),
          ].concat(groupItems);
        })
        .flat(),
    [groupsItems]
  );

  const [groupsHeights, setGroupsHeight] = React.useState(() => {
    return Object.fromEntries(
      Object.entries(groupsItems).map(([id, items]) => [
        id,
        GROUP_HEADER_HEIGHT + items.length * ITEM_SIZE,
      ])
    );
  });

  const updateGroupHeight = React.useCallback(function updateGroupHeight(
    groupId: string,
    newHeight: number
  ) {
    setGroupsHeight((currentGroupsHeight) => {
      return {
        ...currentGroupsHeight,
        [groupId]: newHeight,
      };
    });
  },
  []);

  const groupsHeightsAsArray = Object.entries(groupsHeights).map(
    ([, height]) => height
  );

  const commitDragAndDrop = React.useCallback(
    ({over, active}: {over: Over | null; active: Active}) => {
      setGroupsItems((currentGroupItems) => {
        const localActiveGroupAndIndex = getGroupAndIndexForId(
          currentGroupItems,
          active.id
        );
        if (!over) {
          return currentGroupItems;
        }

        const overGroupAndIndex = getGroupAndIndexForId(
          currentGroupItems,
          over.id
        );

        return moveItem(
          currentGroupItems,
          localActiveGroupAndIndex.groupId,
          localActiveGroupAndIndex.index,
          overGroupAndIndex.groupId,
          overGroupAndIndex.index
        );
      });
    },
    []
  );

  return (
    <DndContext
      layoutMeasuring={layoutMeasuring}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        setActiveId(active.id);
      }}
      // onDragOver={React.useCallback(
      //   ({over, active}: {over: Over | null; active: Active}) => {
      //     return;
      //   },
      //   []
      // )}
      onDragEnd={({over, active}: {over: Over | null; active: Active}) => {
        commitDragAndDrop({over, active});
        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
      modifiers={modifiers}
    >
      <Wrapper
        center
        style={{
          display: 'block',
          height: window.innerHeight - 200,
          border: 'solid 1px #000',
        }}
      >
        <div
          ref={setWrapperDiv}
          style={{
            height: '100%',
            overflowY: 'scroll',
          }}
        >
          <SortableContext items={allItemsIds} strategy={strategy}>
            {Object.entries(groupsItems).map(([groupId, theGroup], index) => {
              return (
                <SubList
                  collapsed={groupsCollapseState[groupId]}
                  toggleCollapse={listCollapseHandler}
                  key={groupId}
                  id={groupId}
                  scrollPosition={elementScrollTop}
                  containerHeight={elementHeight}
                  items={theGroup}
                  getItemStyles={getItemStyles}
                  activeId={activeId}
                  handle={handle}
                  strategy={strategy}
                  offsetInParent={calcMyOffset(index, groupsHeightsAsArray)}
                  listVisualHeightChange={updateGroupHeight}
                />
              );
            })}
          </SortableContext>
        </div>
      </Wrapper>
      {createPortal(
        <DragOverlay adjustScale={adjustScale}>
          {activeGroupAndIndex ? (
            <Item
              value={
                groupsItems[activeGroupAndIndex.groupId][
                  activeGroupAndIndex.index
                ]
              }
              handle={handle}
              style={getItemStyles({
                id: activeGroupAndIndex.groupId[activeGroupAndIndex.index],
                index: activeGroupAndIndex.index,
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

const SubList = React.memo(function SubList({
  id,
  items,
  scrollPosition,
  activeId,
  handle,
  getItemStyles,
  containerHeight,
  collapsed,
  toggleCollapse,
  strategy = verticalListSortingStrategy,
  offsetInParent,
  listVisualHeightChange,
}: {
  id: string;
  items: string[];
  scrollPosition: number;
  activeId: string | null;
  containerHeight: number;
  getItemStyles(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  handle: boolean;
  collapsed: boolean;
  toggleCollapse(isCollapsed: boolean, groupId: string): void;
  strategy: SortingStrategy;
  offsetInParent: number;
  listVisualHeightChange(id: string, newHeight: number): void;
}) {
  const [
    heightChangeDueToCollapse,
    setHeightChangeDueToCollapse,
  ] = React.useState(false);

  React.useLayoutEffect(() => {
    collapsed.toString();
    setHeightChangeDueToCollapse(true);
  }, [collapsed]);

  const finalHeightValue = collapsed ? 0 : items.length * ITEM_SIZE;

  const [
    heightChangePhase,
    heightValue,
    heightChangeEnd,
  ] = useTransitionalChange(
    finalHeightValue,
    // Animate only if the height changes due to collapse / expand
    !heightChangeDueToCollapse
  );

  function heightChangeTransitionEnd(
    event: React.TransitionEvent<HTMLDivElement>
  ) {
    if (
      !(
        event.target instanceof HTMLDivElement &&
        event.target.dataset.elementwithheighttransition
      )
    ) {
      return;
    }

    if (event.propertyName !== 'height') {
      return;
    }

    heightChangeEnd();
    setHeightChangeDueToCollapse(false);
  }

  const {
    setNodeRef: sortableRef,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: groupTitleId(id),
    disabled: true, // never draggable,
    // animateLayoutChanges: () => true,
    data: {
      groupId: id,
      isGroupTitle: true,
    },
  });

  const droppable = useDroppable({
    id: groupWrapperId(id),
    disabled: false,
    data: {
      groupId: id,
      isGroupWrapper: true,
    },
  });

  const background = 'red';

  const renderItemList =
    (heightChangePhase === 'idle' && heightValue !== 0) ||
    heightChangePhase !== 'idle';

  const applyHeightAnimationStyle =
    heightChangePhase === 'beforeAnimation' ||
    heightChangePhase === 'duringAnimation';

  React.useEffect(() => {
    if (
      // if new value is smaller, report immediately,
      // if bigger, only after the animation is over
      (finalHeightValue < heightValue &&
        heightChangePhase === 'beforeAnimation') ||
      heightChangePhase === 'afterAnimation'
    ) {
      listVisualHeightChange(id, finalHeightValue + GROUP_HEADER_HEIGHT);
    }
  }, [
    finalHeightValue,
    heightChangePhase,
    heightValue,
    id,
    listVisualHeightChange,
  ]);

  return (
    <>
      {/* <SortableContext items={itemsIds} strategy={strategy}> */}
      <div
        ref={droppable.setNodeRef}
        style={
          {
            // border: 'solid 1px blue',
          }
        }
      >
        <div
          ref={sortableRef}
          style={{
            height: 50,
            background,
            transform: CSS.Transform.toString(transform),
            transition: transition ?? undefined,
          }}
          {...listeners}
          onDoubleClick={() => toggleCollapse(!collapsed, id)}
        >
          LIST TITLE {id} - {items.length}
        </div>
        <div
          data-elementwithheighttransition={true}
          style={{
            height: heightValue,
            // more correct, but there's a flicker after collapse (???)
            // overflow: applyHeightAnimationStyle ? 'hidden' : undefined,

            // workaround for above issue
            overflow: activeId ? undefined : 'hidden',
            transition: applyHeightAnimationStyle
              ? 'height ease 300ms'
              : undefined,
          }}
          onTransitionEnd={heightChangeTransitionEnd}
        >
          {renderItemList && (
            <ContainedVirtualizedList
              containerScrollTop={scrollPosition}
              containerHeight={containerHeight}
              className={styles.VirtualList}
              itemCount={items.length}
              itemHeight={ITEM_SIZE}
              overscanCount={0}
              offsetTopInsideScrollableArea={
                offsetInParent + GROUP_HEADER_HEIGHT
              }
              renderItem={({index, style}) => {
                const id = items[index];

                return (
                  <SortableItem
                    data={{groupId: id}}
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
                    // animateLayoutChanges={() => true}
                  />
                );
              }}
            />
          )}
        </div>
      </div>
      {/* </SortableContext> */}
    </>
  );
});

function calcMyOffset(index: number, groupsHeights: number[]) {
  return groupsHeights.slice(0, index).reduce((s, c) => s + c, 0);
}
