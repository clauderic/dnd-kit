import type {UniqueIdentifier, DndContextDescriptor} from '@dnd-kit/core';
import {useSyncExternalStore} from 'use-sync-external-store';
import {defaultNewIndexGetter} from '../hooks/defaults';
import {isValidIndex} from '../utilities';

export function createSortingAPI(
  items: UniqueIdentifier[],
  activeAndOverAPI: DndContextDescriptor['activeAndOverAPI'],
  getNewIndex = defaultNewIndexGetter
) {
  let activeIndex: number = -1;
  let overIndex: number = -1;
  calculateIndexes();

  const registry: (() => void)[] = [];

  function subscribe(listener: () => void) {
    registry.push(listener);
    return () => {
      registry.splice(registry.indexOf(listener), 1);
    };
  }

  function calculateIndexes() {
    const active = activeAndOverAPI.getActive();
    activeIndex = active ? items.indexOf(active.id) : -1;
    const over = activeAndOverAPI.getOver();
    overIndex = over ? items.indexOf(over.id) : -1;
  }

  const unsubscribeFromActiveAndOver = activeAndOverAPI.subscribe(() => {
    registry.forEach((li) => li());
  });

  return {
    clear: unsubscribeFromActiveAndOver,
    useMyNewIndex: (id: UniqueIdentifier, currentIndex: number) => {
      return useSyncExternalStore(subscribe, () => {
        return isValidIndex(activeIndex) && isValidIndex(overIndex)
          ? getNewIndex({id, items, activeIndex, overIndex})
          : currentIndex;
      });
    },
    getActiveIndex: () => activeIndex,
    getOverIndex: () => overIndex,
  };
}
