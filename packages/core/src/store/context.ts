import {createContext} from 'react';

import {noop} from '../utilities/other';
import {DroppableContainersMap} from './constructors';
import type {DndContextDescriptor} from './types';

export const Context = createContext<DndContextDescriptor>({
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  activeNodeClientRect: null,
  activators: [],
  ariaDescribedById: {
    draggable: '',
  },
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
    transform: {
      current: null,
    },
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeLayouts: noop,
  windowRect: null,
  willRecomputeLayouts: false,
});
