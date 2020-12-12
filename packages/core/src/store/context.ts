import {createContext} from 'react';

import {noop} from '../utilities/other';
import {DndContextDescriptor} from './types';

export const Context = createContext<DndContextDescriptor>({
  activatorEvent: null,
  active: null,
  activeRect: null,
  activators: [],
  ariaDescribedById: {
    draggable: '',
  },
  cloneNode: {
    nodeRef: {
      current: null,
    },
    clientRect: null,
    setRef: noop,
  },
  dispatch: noop,
  draggableNodes: {},
  droppableClientRects: new Map(),
  droppableContainers: {},
  over: null,
  scrollingContainerRect: null,
  recomputeClientRects: noop,
  willRecomputeClientRects: false,
});
