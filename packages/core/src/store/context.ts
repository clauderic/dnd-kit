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
  containerNodeRect: null,
  dispatch: noop,
  draggableNodes: {},
  droppableRects: new Map(),
  droppableContainers: {},
  over: null,
  overlayNode: {
    nodeRef: {
      current: null,
    },
    rect: null,
    setRef: noop,
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeLayouts: noop,
  windowRect: null,
  willRecomputeLayouts: false,
});
