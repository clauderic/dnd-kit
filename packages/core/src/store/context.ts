import {createContext} from 'react';

import {noop} from '../utilities/other';
import {State, DraggableContextType} from './types';

export const initialState: State = {
  active: null,
  droppableContainers: {},
};

export const Context = createContext<DraggableContextType>({
  activatorEvent: null,
  active: null,
  activeRect: null,
  activators: [],
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
