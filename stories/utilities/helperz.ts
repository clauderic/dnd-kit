import type {Active, Over} from '@dnd-kit/core';
import React from 'react';

export type GroupsData = {
  [key: string]: string[];
};

/**
 * return something like:
 * {
 *  a: ["a1", "a2", "a3"],
 *  b: ["b1", "b2", "b3"],
 *  ....
 * }
 */
export function generateGroups(
  howManyGroups: number,
  howManyItemsPerGroup: number
): GroupsData {
  const groups = Object.fromEntries(
    Array.from({length: howManyGroups}, (_, groupIndex): [string, string[]] => {
      const groupId = String.fromCharCode('a'.charCodeAt(0) + groupIndex);
      return [
        groupId,
        Array.from(
          {length: howManyItemsPerGroup},
          (_, itemIndex) => `${groupId}${itemIndex}`
        ),
      ];
    })
  );

  return groups;
}

export function generateGroupsCollapseState(howManyGroups: number) {
  return Object.fromEntries(
    Array.from({length: howManyGroups}, (_, groupIndex): [string, boolean] => {
      const groupId = String.fromCharCode('a'.charCodeAt(0) + groupIndex);
      return [groupId, false];
    })
  );
}

export function findGroupOfItemId(groupsData: GroupsData, id: string) {
  if (id.startsWith(groupWrapperId('')) || id.startsWith(groupTitleId(''))) {
    throw new Error('invariant');
  }

  const foundGroup = Object.entries(groupsData).filter(([, groupItems]) => {
    return groupItems.includes(id);
  });

  if (foundGroup.length !== 1) {
    throw new Error('invariant');
  }

  return foundGroup[0][0];
}

export interface MoveOperationInstructions {
  groupFromId: string;
  groupFromItemIndex: number;
  groupToId: string;
  groupToItemIndex: number;
}

export function moveItem(
  groupsData: GroupsData,
  groupFromId: string,
  groupFromItemIndex: number,
  groupToId: string,
  groupToItemIndex: number
): GroupsData {
  const groupFrom = groupsData[groupFromId];
  const groupTo = groupsData[groupToId];

  if (!groupFrom || !groupTo) {
    throw new Error('invariant');
  }

  if (groupFromItemIndex > groupFrom.length || groupFromItemIndex < 0) {
    throw new Error('invariant');
  }

  if (groupToItemIndex > groupTo.length || groupToItemIndex < 0) {
    throw new Error('invariant');
  }

  // move inside same group
  if (groupFromId === groupToId) {
    const newGroup = groupFrom.slice(0);
    const itemToMove = newGroup.splice(groupFromItemIndex, 1)[0];

    newGroup.splice(groupToItemIndex, 0, itemToMove);
    return {
      ...groupsData,
      [groupFromId]: newGroup,
    };
  }
  // move between groups
  else {
    const newGroupFrom = groupFrom.slice(0);
    const newGroupTo = groupTo.slice(0);
    const itemToMove = newGroupFrom.splice(groupFromItemIndex, 1)[0];

    newGroupTo.splice(groupToItemIndex, 0, itemToMove);
    return {
      ...groupsData,
      [groupFromId]: newGroupFrom,
      [groupToId]: newGroupTo,
    };
  }
}

export function groupTitleId(groupId: string) {
  return `group_title_${groupId}`;
}

export function groupWrapperId(groupId: string) {
  return `group_wrapper_${groupId}`;
}

export function useElementHeightAndScrollPosition(element: HTMLElement | null) {
  const [elementScrollTop, setElementScrollTop] = React.useState(0);
  const [elementHeight, setElementHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!element) {
      return;
    }

    setElementScrollTop(element.scrollTop);

    function onScroll() {
      if (element) {
        setElementScrollTop(element.scrollTop);
      }
    }

    element.addEventListener('scroll', onScroll);

    return function cleanup() {
      element.removeEventListener('scroll', onScroll);
    };
  }, [element]);

  React.useLayoutEffect(() => {
    if (!element) {
      return;
    }

    setElementHeight(element.getBoundingClientRect().height);

    function onResize() {
      if (!element) {
        return;
      }

      setElementHeight(element.getBoundingClientRect().height);
    }

    window.addEventListener('resize', onResize);

    return function cleanup() {
      window.removeEventListener('resize', onResize);
    };
  }, [element]);

  return {
    elementScrollTop,
    elementHeight,
  };
}

export function calcMyOffset(index: number, groupsHeights: number[]) {
  return groupsHeights.slice(0, index).reduce((s, c) => s + c, 0);
}

export function buildGroupIdsToIndex(groupsData: GroupsData) {
  return Object.fromEntries(
    Object.keys(groupsData).map((key, index) => [key, index])
  );
}

export function buildGroupIdsArray(groupsData: GroupsData) {
  return Object.keys(groupsData);
}

export function useConsoleLog(...args: any[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const argsArray = React.useMemo(() => [...args], [...args]);
  const prev = usePreviousDistinct(argsArray, argsArray);

  React.useEffect(() => {
    if (argsArray !== prev) {
      console.log(...argsArray);
    }
  }, [argsArray, prev]);
}

export function usePreviousDistinct<T>(value: T, initialValue: T): T {
  const previous = React.useRef(initialValue);
  const current = React.useRef(initialValue);

  if (current.current !== value) {
    previous.current = current.current;
    current.current = value;
  }

  return previous.current;
}

export function whereToMoveItem(
  groupsData: GroupsData,
  activeItemData: ListItemData,
  overItemData: ListItemData
): MoveOperationInstructions | null {
  // item pushed is over the list title in his own list
  if (
    overItemData.isGroupTitle &&
    activeItemData.groupId === overItemData.groupId
  ) {
    // the list is the first list, no where to go.
    if (overItemData.groupIndex === 0) {
      return null;
    }

    const groupToId = buildGroupIdsArray(groupsData)[
      overItemData.groupIndex - 1
    ];

    // Move to after the last index on the prev group
    return {
      groupFromId: activeItemData.groupId,
      groupFromItemIndex: activeItemData.itemIndex,
      groupToId,
      groupToItemIndex: groupsData[groupToId].length,
    };
  }

  return {
    groupFromId: activeItemData.groupId,
    groupFromItemIndex: activeItemData.itemIndex,
    groupToId: overItemData.groupId,
    groupToItemIndex: overItemData.itemIndex,
  };
}

export interface ListItemData {
  id: string;
  groupId: string;
  groupIndex: number;
  itemIndex: number;
  isGroupTitle?: boolean;
  isGroupWrapper?: boolean;
}

export function readItemData(item: Active | Over): ListItemData {
  const itemData = item.data.current;

  if (!itemData) {
    throw new Error('invariant');
  }

  if (!('itemIndex' in itemData)) {
    throw new Error('invariant. maybe the item was virtualized out');
  }

  // @ts-expect-error
  return {id: item.id, ...itemData};
}
