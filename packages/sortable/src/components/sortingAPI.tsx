import type {
  UniqueIdentifier,
  DndContextDescriptor,
  ClientRect,
} from '@dnd-kit/core';
import {useSyncExternalStore} from 'use-sync-external-store/shim';
import {defaultNewIndexGetter} from '../hooks/defaults';
import type {SortingStrategy} from '../types';
import {getSortedRects, isValidIndex, itemsEqual} from '../utilities';

export function createSortingAPI(
  activeAndOverAPI: DndContextDescriptor['activeAndOverAPI'],
  getNewIndex = defaultNewIndexGetter,
  strategy: SortingStrategy
) {
  let unsubscribeFromActiveAndOver = () => {};
  let activeIndex: number = -1;
  let overIndex: number = -1;
  let items: UniqueIdentifier[] = [];
  let itemsHaveChanged = false;
  let droppableRects: Map<UniqueIdentifier, ClientRect> = new Map();
  let sortedRecs: ClientRect[] = [];
  calculateIndexes();

  let registry: (() => void)[] = [];

  function subscribe(listener: () => void) {
    registry.push(listener);
    return () => {
      registry.splice(registry.indexOf(listener), 1);
    };
  }

  function calculateIndexes() {
    const active = activeAndOverAPI.getActive();
    if (!active) {
      overIndex = -1;
      activeIndex = -1;
      return;
    }
    const over = activeAndOverAPI.getOver();
    activeIndex = active ? items.indexOf(active.id) : -1;
    overIndex = over ? items.indexOf(over.id) : -1;
  }

  function shouldDisplaceItems() {
    return (
      isValidIndex(overIndex) && isValidIndex(activeIndex) && !itemsHaveChanged
    );
  }

  return {
    silentSetSortingInfo: (
      droppable: Map<UniqueIdentifier, ClientRect>,
      newItems: UniqueIdentifier[]
    ) => {
      if (droppableRects !== droppable) {
        droppableRects = droppable;
        sortedRecs = getSortedRects(newItems, droppableRects);
      }
      if (newItems !== items && !itemsEqual(newItems, items)) {
        items = newItems;
        itemsHaveChanged = true;
      } else {
        itemsHaveChanged = false;
      }
    },
    init: () => {
      unsubscribeFromActiveAndOver = activeAndOverAPI.subscribe(() => {
        calculateIndexes();
        registry.forEach((li) => li());
      });
    },
    clear: () => {
      unsubscribeFromActiveAndOver();
    },
    useMyNewIndex: (id: UniqueIdentifier, currentIndex: number) => {
      return useSyncExternalStore(subscribe, () => {
        return isValidIndex(activeIndex) && isValidIndex(overIndex)
          ? getNewIndex({id, items, activeIndex, overIndex})
          : currentIndex;
      });
    },

    useMyStrategyValue(
      id: UniqueIdentifier,
      currentIndex: number,
      activeNodeRect: ClientRect | null
    ) {
      return useSyncExternalStore(subscribe, () => {
        if (!shouldDisplaceItems() || currentIndex === activeIndex) {
          return null;
        }
        const delta = strategy({
          id,
          activeNodeRect,
          rects: sortedRecs,
          activeIndex,
          overIndex,
          index: currentIndex,
        });

        const deltaJson = JSON.stringify(delta);
        if (deltaJson === JSON.stringify({x: 0, y: 0, scaleX: 1, scaleY: 1})) {
          return null;
        }
        return deltaJson;
      });
    },
    getOverIndex: () => overIndex,
    getItemsHaveChanged: () => itemsHaveChanged,
    getShouldDisplaceItems: () => shouldDisplaceItems(),
  };
}
