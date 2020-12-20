import {createContext} from 'react';

import {noop} from '../utilities/other';
import {DndContextDescriptor} from './types';

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
  overlayNode: {
    nodeRef: {
      current: null,
    },
    rect: null,
    setRef: noop,
  },
  containerNodeRect: null,
  dispatch: noop,
  draggableNodes: {},
  droppableLayoutRectsMap: new Map(),
  droppableContainers: {},
  over: null,
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeLayouts: noop,
  windowRect: null,
  willRecomputeLayouts: false,
});
