/**
What's missing:
 - Drop location indication
 - Animation when moving item to a collapsed group
 - Title of first group is moveable
 - ....
*/

import React, {useState} from 'react';
import {createPortal} from 'react-dom';
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
  // Active,
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
// import {CustomCollisionDetection} from './CustomCollisionDetection';
import {useTransitionalChange} from '../../utilities/useTransitionalChange';
import {
  calcMyOffset,
  generateGroups,
  generateGroupsCollapseState,
  groupTitleId,
  groupWrapperId,
  ListItemData,
  moveItem,
  readItemData,
  // useConsoleLog,
  useElementHeightAndScrollPosition,
  whereToMoveItem,
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
const HOW_MANY_ITEMS_PER_GROUP = 4;

const SHOW_VISUAL_GROUPS_BORDER = true;

function Sortable({
  adjustScale = false,
  strategy = verticalListSortingStrategy,
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

  // const collisionDetection = React.useMemo(
  //   function () {
  //     const groupsWrappersIds = Object.entries(groupsItems).map(([id]) =>
  //       groupWrapperId(id)
  //     );

  //     const groupsWrappersItemIdsMap = Object.fromEntries(
  //       Object.entries(groupsItems).map(([groupId]) => {
  //         return [
  //           groupWrapperId(groupId),
  //           groupsCollapseState[groupId]
  //             ? [groupTitleId(groupId)]
  //             : [groupTitleId(groupId), ...groupsItems[groupId]],
  //         ];
  //       })
  //     );

  //     return CustomCollisionDetection(
  //       groupsWrappersIds,
  //       groupsWrappersItemIdsMap
  //     );
  //   },
  //   [groupsCollapseState, groupsItems]
  // );

  const {elementHeight, elementScrollTop} = useElementHeightAndScrollPosition(
    wrapperDiv
  );

  const [activeItemData, setActiveItemData] = useState<ListItemData | null>(
    null
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const listCollapseHandler = React.useCallback(
    (collapsed: boolean, groupId: string) => {
      setGroupsCollapseState((prev) => {
        return {...prev, [groupId]: collapsed};
      });
    },
    []
  );

  const itemIdsFromAllGroups = React.useMemo(
    () =>
      Object.entries(groupsItems)
        .map(([id, groupItems]) => {
          return [
            // this tripping the group title on dragovers
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
    (activeItemData: ListItemData, overItemData: ListItemData) => {
      setGroupsItems((currentGroupItems) => {
        const instructions = whereToMoveItem(
          currentGroupItems,
          activeItemData,
          overItemData
        );

        if (!instructions) {
          console.warn('not going anywhere', instructions);
          return currentGroupItems;
        }

        return moveItem(
          currentGroupItems,
          instructions.groupFromId,
          instructions.groupFromItemIndex,
          instructions.groupToId,
          instructions.groupToItemIndex
        );
      });
    },
    []
  );

  const [quickAddItemValue, setQuickAddItemValue] = React.useState('');

  function addQuickItem() {
    const groupIdToAddTo = 'a';

    if (!quickAddItemValue) {
      return;
    }

    setGroupsItems((currentGroupItems) => {
      const groupToAddTo = currentGroupItems[groupIdToAddTo].slice();
      groupToAddTo.unshift(quickAddItemValue);

      return {
        ...currentGroupItems,
        [groupIdToAddTo]: groupToAddTo,
      };
    });
  }

  return (
    <DndContext
      layoutMeasuring={layoutMeasuring}
      sensors={sensors}
      // collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        const activeData = readItemData(active);

        setActiveItemData(activeData);
      }}
      // onDragOver={React.useCallback(
      //   ({over, active}: {over: Over | null; active: Active}) => {
      //     return;
      //   },
      //   []
      // )}
      onDragEnd={({over}: {over: Over | null}) => {
        if (!over || !activeItemData) {
          return;
        }

        const overItemData = readItemData(over);

        commitDragAndDrop(activeItemData, overItemData);
        setActiveItemData(null);
      }}
      onDragCancel={() => setActiveItemData(null)}
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
          style={{
            width: 100,
            height: 50,
            position: 'fixed',
            top: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 3,
          }}
        >
          <input
            type="text"
            placeholder="Quick add item"
            value={quickAddItemValue}
            onChange={(e) => {
              setQuickAddItemValue(e.target.value);
            }}
          />
          <button onClick={addQuickItem}>Add item</button>
        </div>
        <div
          ref={setWrapperDiv}
          style={{
            height: '100%',
            overflowY: 'scroll',
          }}
        >
          <SortableContext items={itemIdsFromAllGroups} strategy={strategy}>
            {Object.entries(groupsItems).map(([groupId, theGroup], index) => {
              return (
                <SubList
                  collapsed={groupsCollapseState[groupId]}
                  toggleCollapse={listCollapseHandler}
                  key={groupId}
                  groupId={groupId}
                  groupIndex={index}
                  scrollPosition={elementScrollTop}
                  containerHeight={elementHeight}
                  items={theGroup}
                  getItemStyles={getItemStyles}
                  activeId={activeItemData?.id ?? null}
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
          {activeItemData ? (
            <Item
              value={
                groupsItems[activeItemData.groupId][activeItemData.itemIndex]
              }
              handle={handle}
              style={getItemStyles({
                id: activeItemData.groupId[activeItemData.itemIndex],
                index: activeItemData.itemIndex,
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
  groupId,
  groupIndex,
  items,
  scrollPosition,
  activeId,
  handle,
  getItemStyles,
  containerHeight,
  collapsed,
  toggleCollapse,
  offsetInParent,
  listVisualHeightChange,
}: {
  groupId: string;
  groupIndex: number;
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

  const finalHeightValue = collapsed ? 0 : items.length * ITEM_SIZE;
  const [itemsOnRecentCollapse, setItemsOnRecentCollapse] = React.useState<
    string[]
  >([]);

  function titleDoubleClick() {
    setHeightChangeDueToCollapse((prev) => !prev);
    toggleCollapse(!collapsed, groupId);
  }

  // Animate only if the height changes due to collapse / expand
  const disableHeightTransition = !heightChangeDueToCollapse;
  // const disableHeightTransition = false;

  // for debug only
  // if (groupId === 'a') {
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   useConsoleLog(groupId, disableHeightTransition);
  // }

  const [
    heightChangePhase,
    heightValue,
    heightChangeEnd,
  ] = useTransitionalChange(finalHeightValue, disableHeightTransition);

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
    id: groupTitleId(groupId),
    disabled: true, // never draggable,
    data: {
      groupIndex,
      groupId,
      itemIndex: 0,
      isGroupTitle: true,
    },
  });

  const droppableGroupWrapper = useDroppable({
    id: groupWrapperId(groupId),
    disabled: false,
    data: {
      groupIndex,
      groupId,
      itemIndex: 0,
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
      heightChangePhase === 'afterAnimation' ||
      disableHeightTransition
    ) {
      listVisualHeightChange(groupId, finalHeightValue + GROUP_HEADER_HEIGHT);
    }
  }, [
    finalHeightValue,
    heightChangePhase,
    heightValue,
    groupId,
    listVisualHeightChange,
    disableHeightTransition,
  ]);

  return (
    <>
      <div
        ref={droppableGroupWrapper.setNodeRef}
        style={{
          border: SHOW_VISUAL_GROUPS_BORDER ? 'solid 1px blue' : undefined,
        }}
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
          onDoubleClick={titleDoubleClick}
        >
          LIST TITLE {groupId} - {items.length}
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
              // 0 helps to find bugs with virtualization calculations
              overscanCount={0}
              offsetTopInsideScrollableArea={
                offsetInParent + GROUP_HEADER_HEIGHT
              }
              renderItem={({index, style}) => {
                const id = items[index];

                return (
                  <SortableItem
                    data={{groupId, itemIndex: index}}
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
    </>
  );
});
