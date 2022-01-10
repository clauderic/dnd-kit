import {createContext} from 'react';

import {noop} from '../utilities/other';
import {DroppableContainersMap} from './constructors';
import type {InternalContextDescriptor, PublicContextDescriptor} from './types';

export const defaultPublicContext: PublicContextDescriptor = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
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
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false,
};

export const defaultInternalContext: InternalContextDescriptor = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: '',
  },
  dispatch: noop,
  draggableNodes: {},
  over: null,
  measureDroppableContainers: noop,
};

export const InternalContext = createContext<InternalContextDescriptor>(
  defaultInternalContext
);

export const PublicContext = createContext<PublicContextDescriptor>(
  defaultPublicContext
);
