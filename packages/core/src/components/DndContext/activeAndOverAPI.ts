import type {MutableRefObject} from 'react';
import {useSyncExternalStore} from 'use-sync-external-store/shim';
import type {Active, Over} from '../../store';

import type {UniqueIdentifier, ClientRect} from '../../types';
import {defaultData} from './defaults';

type Rects = MutableRefObject<{
  initial: ClientRect | null;
  translated: ClientRect | null;
}>;

export function createActiveAndOverAPI(rect: Rects) {
  let activeId: UniqueIdentifier | null = null;
  let active: Active | null = null;

  let activatorEvent: Event | null = null;
  const draggableNodes = new Map<UniqueIdentifier, any>();
  const activeRects = rect;

  let over: Over | null = null;

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
    subscribe,
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

    setOver: function (overInfo: Over | null) {
      over = overInfo;
      registry.forEach((li) => li());
    },

    getActive: () => active,
    getOver: () => over,

    useIsDragging: function (id: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () => activeId === id);
    },

    useActive: function () {
      return useSyncExternalStore(subscribe, () => active);
    },

    useMyActive: function (id: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () =>
        activeId === id ? active : null
      );
    },

    useMyActiveForDroppable: function (droppableId: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () => {
        return over && over.id === droppableId ? active : null;
      });
    },

    useActivatorEvent: function () {
      return useSyncExternalStore(subscribe, () => activatorEvent);
    },
    useMyActivatorEvent: function (id: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () =>
        activeId === id ? activatorEvent : null
      );
    },

    useMyOverForDraggable: function (draggableId: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () =>
        activeId === draggableId ? over : null
      );
    },
    useMyOverForDroppable: function (droppableId: UniqueIdentifier) {
      return useSyncExternalStore(subscribe, () =>
        over && over.id === droppableId ? over : null
      );
    },
    useOver: function () {
      return useSyncExternalStore(subscribe, () => over);
    },
  };
}
