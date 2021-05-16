import React from 'react';

type GroupsData = {
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

export function moveItem(
  groupsData: GroupsData,
  groupFromId: string,
  groupFromIndex: number,
  groupToId: string,
  groupToIndex: number
): GroupsData {
  const groupFrom = groupsData[groupFromId];
  const groupTo = groupsData[groupToId];

  if (!groupFrom || !groupTo) {
    throw new Error('invariant');
  }

  if (groupFromIndex > groupFrom.length || groupFromIndex < 0) {
    throw new Error('invariant');
  }

  if (groupToIndex > groupTo.length || groupToIndex < 0) {
    throw new Error('invariant');
  }

  // move inside same group
  if (groupFromId === groupToId) {
    const newGroup = groupFrom.slice(0);
    const itemToMove = newGroup.splice(groupFromIndex, 1)[0];

    newGroup.splice(groupToIndex, 0, itemToMove);
    return {
      ...groupsData,
      [groupFromId]: newGroup,
    };
  }
  // move between groups
  else {
    const newGroupFrom = groupFrom.slice(0);
    const newGroupTo = groupTo.slice(0);
    const itemToMove = newGroupFrom.splice(groupFromIndex, 1)[0];

    newGroupTo.splice(groupToIndex, 0, itemToMove);
    return {
      ...groupsData,
      [groupFromId]: newGroupFrom,
      [groupToId]: newGroupTo,
    };
  }
}

export function getGroupAndIndexForId(groupsItems: GroupsData, itemId: string) {
  // land on group title
  if (itemId.startsWith(groupTitleId(''))) {
    const groupId = itemId.replace(groupTitleId(''), '');
    return {
      groupId,
      index: 0,
    };
  }

  if (itemId.startsWith(groupWrapperId(''))) {
    const groupId = itemId.replace(groupWrapperId(''), '');
    return {
      groupId,
      index: 0,
    };
  }

  const groupId = findGroupOfItemId(groupsItems, itemId);
  const index = groupsItems[groupId].indexOf(itemId);

  return {
    groupId,
    index,
  };
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
