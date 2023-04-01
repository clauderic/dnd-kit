import type {UniqueIdentifier, DndContextDescriptor} from '@dnd-kit/core';
import {useSyncExternalStore} from 'use-sync-external-store/shim';
import {defaultNewIndexGetter} from '../hooks/defaults';
import {isValidIndex} from '../utilities';

export function createSortingAPI(
  activeAndOverAPI: DndContextDescriptor['activeAndOverAPI'],
  getNewIndex = defaultNewIndexGetter
) {
  let activeIndex: number = -1;
  let overIndex: number = -1;
  let items: UniqueIdentifier[] = [];
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
    items = active?.data.current?.sortable.items;

    activeIndex = active ? items.indexOf(active.id) : -1;
    overIndex = over ? items.indexOf(over.id) : -1;
  }

  const unsubscribeFromActiveAndOver = activeAndOverAPI.subscribe(() => {
    calculateIndexes();
    registry.forEach((li) => li());
  });

  return {
    clear: () => {
      unsubscribeFromActiveAndOver();
      registry = [];
    },
    useMyNewIndex: (id: UniqueIdentifier, currentIndex: number) => {
      return useSyncExternalStore(subscribe, () => {
        return isValidIndex(activeIndex) && isValidIndex(overIndex)
          ? getNewIndex({id, items, activeIndex, overIndex})
          : currentIndex;
      });
    },
    getOverIndex: () => overIndex,
  };
}
