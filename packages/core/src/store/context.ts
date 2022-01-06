import {createContext} from 'react';

import {noop} from '../utilities/other';
import {DroppableContainersMap} from './constructors';
import type {DndContextDescriptor} from './types';

export const Context = createContext<DndContextDescriptor>({
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  activators: [],
  ariaDescribedById: {
    draggable: '',
  },
  collisions: null,
  containerNodeRect: null,
  dispatch: noop,
  draggableNodes: {},
  droppableRects: new Map(),
  droppableContainers: new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null,
    },
    rect: null,
    setRef: noop,
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeRects: noop,
  windowRect: null,
  willRecomputeRects: false,
});
