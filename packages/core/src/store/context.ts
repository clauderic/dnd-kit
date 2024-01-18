import {createContext} from 'react';

import {noop} from '../utilities/other';
import {defaultMeasuringConfiguration} from '../components/DndContext/defaults';
import {DroppableContainersMap} from './constructors';
import type {
  AnyData,
  InternalContextDescriptor,
  PublicContextDescriptor,
} from './types';

export const defaultPublicContext: PublicContextDescriptor<AnyData, AnyData> = {
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
};

export const defaultInternalContext: InternalContextDescriptor<
  AnyData,
  AnyData
> = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: '',
  },
  dispatch: noop,
  draggableNodes: new Map(),
  over: null,
  measureDroppableContainers: noop,
};

export const InternalContext = createContext<
  InternalContextDescriptor<AnyData, AnyData>
>(defaultInternalContext);

export const PublicContext =
  createContext<PublicContextDescriptor<AnyData, AnyData>>(
    defaultPublicContext
  );
