import {createContext} from 'react';

import {noop} from '../utilities/other';
import {defaultMeasuringConfiguration} from '../components/DndContext/defaults';
import {DroppableContainersMap} from './constructors';
import type {InternalContextDescriptor, PublicContextDescriptor} from './types';
import {createActiveAndOverAPI} from '../components/DndContext/activeAndOverAPI';

export const defaultPublicContext: PublicContextDescriptor = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: new Map(),
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
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false,
  activeAndOverAPI: createActiveAndOverAPI({
    current: {initial: null, translated: null},
  }),
};

export const defaultInternalContext: InternalContextDescriptor = {
  activators: [],
  ariaDescribedById: {
    draggable: '',
  },
  dispatch: noop,
  draggableNodes: new Map(),
  measureDroppableContainers: noop,
  useMyActive: () => null,
  useMyActiveForDroppable: () => null,
  useGloablActive: () => null,
  useMyActivatorEvent: () => null,
  useGlobalActivatorEvent: () => null,
  useMyActiveNodeRect: () => null,
  isDefaultContext: true,
  useMyOverForDraggable: () => null,
  useMyOverForDroppable: () => null,
};

export const InternalContext = createContext<InternalContextDescriptor>(
  defaultInternalContext
);

export const PublicContext =
  createContext<PublicContextDescriptor>(defaultPublicContext);
