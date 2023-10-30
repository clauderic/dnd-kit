import type {MutableRefObject} from 'react';
import {useSyncExternalStore} from 'use-sync-external-store/shim';
import type {Active} from '../../store';

import type {UniqueIdentifier, ClientRect} from '../../types';
import {defaultData} from './defaults';

type Rects = MutableRefObject<{
  initial: ClientRect | null;
  translated: ClientRect | null;
}>;

export function createActiveAPI(rect: Rects) {
  let activeId: UniqueIdentifier | null = null;
  let active: Active | null = null;

  let activatorEvent: Event | null = null;
  const draggableNodes = new Map<UniqueIdentifier, any>();
  const activeRects = rect;

  const registry: (() => void)[] = [];

  function subscribe(listener: () => void) {
    registry.push(listener);
    return () => {
      registry.splice(registry.indexOf(listener), 1);
    };
  }

  function getActiveInfo() {
    if (!activeId) return null;
    const node = draggableNodes.get(activeId);
    return {
      id: activeId,
      rect: activeRects,
      data: node ? node.data : defaultData,
    };
  }

  return {
    draggableNodes,
    setActive: function (id: UniqueIdentifier | null) {
      if (activeId === id) return;
      activeId = id;
      active = getActiveInfo();
      registry.forEach((li) => li());
    },

    setActivatorEvent: function (event: Event | null) {
      activatorEvent = event;
      registry.forEach((li) => li());
    },

    useIsDragging: function (id: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () => activeId === id);
    },

    useHasActive: function () {
      return useSyncExternalStore(subscribe, () => activeId !== null);
    },
    useActive: function () {
      return useSyncExternalStore(subscribe, () => active);
    },

    useMyActive: function (id: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () =>
        activeId === id ? active : null
      );
    },

    useActivatorEvent: function () {
      return useSyncExternalStore(subscribe, () => activatorEvent);
    },
    useMyActivatorEvent: function (id: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () =>
        activeId === id ? activatorEvent : null
      );
    },
  };
}
