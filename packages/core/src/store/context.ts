import {createContext} from 'react';

import {noop} from '../utilities/other';
import {DraggableContextType} from './types';

export const Context = createContext<DraggableContextType>({
  activatorEvent: null,
  active: null,
  activeRect: null,
  activators: [],
  ariaDescribedById: {
    draggable: '',
  },
  clientRects: new Map(),
  cloneNode: {
    nodeRef: {
      current: null,
    },
    clientRect: null,
    setRef: noop,
  },
  dispatch: noop,
  droppableContainers: {},
  over: null,
  scrollingContainerRect: null,
  recomputeClientRects: noop,
  willRecomputeClientRects: false,
});
